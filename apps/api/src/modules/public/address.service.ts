import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

export interface AddressRow {
  id: string;
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  addressType: string;
  isDefault: boolean;
}

const SELECT_COLS = `
  id, user_id, full_name, mobile, address_line1, address_line2, landmark,
  city, state, pincode, address_type, is_default, created_at, updated_at
`;

function toApi(row: any): AddressRow {
  return {
    id: row.id,
    fullName: row.full_name,
    mobile: row.mobile,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    landmark: row.landmark,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    addressType: row.address_type,
    isDefault: row.is_default,
  };
}

@Injectable()
export class AddressService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** Every read/update/delete goes through this ownership check. */
  private assertOwnership(rowUserId: string, userId: string) {
    if (rowUserId !== userId) {
      // Treat as not-found: never leak the existence of another user's address.
      throw new NotFoundException('Address not found');
    }
  }

  async list(userId: string): Promise<AddressRow[]> {
    const rows = await this.dataSource.query(
      `SELECT ${SELECT_COLS} FROM customer_addresses WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [userId],
    );
    return rows.map(toApi);
  }

  async get(userId: string, id: string): Promise<AddressRow> {
    const rows = await this.dataSource.query(
      `SELECT ${SELECT_COLS} FROM customer_addresses WHERE id = $1`,
      [id],
    );
    if (!rows.length) throw new NotFoundException('Address not found');
    this.assertOwnership(rows[0].user_id, userId);
    return toApi(rows[0]);
  }

  async create(userId: string, dto: CreateAddressDto): Promise<AddressRow> {
    const q = this.dataSource.createQueryRunner();
    await q.connect();
    await q.startTransaction();
    try {
      const existing = await q.query(`SELECT COUNT(*)::int AS n FROM customer_addresses WHERE user_id = $1`, [userId]);
      const makeDefault = dto.isDefault === true || existing[0].n === 0;

      if (makeDefault) {
        await q.query(`UPDATE customer_addresses SET is_default = false WHERE user_id = $1`, [userId]);
      } else if (existing[0].n >= 20) {
        throw new BadRequestException('Address book is full (max 20 addresses)');
      }

      const [row] = await q.query(
        `INSERT INTO customer_addresses
           (user_id, full_name, mobile, address_line1, address_line2, landmark, city, state, pincode, address_type, is_default)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING ${SELECT_COLS}`,
        [
          userId,
          dto.fullName.trim(),
          dto.mobile,
          dto.addressLine1.trim(),
          dto.addressLine2?.trim() || null,
          dto.landmark?.trim() || null,
          dto.city.trim(),
          dto.state.trim(),
          dto.pincode,
          dto.addressType,
          makeDefault,
        ],
      );
      await q.commitTransaction();
      return toApi(row);
    } catch (err) {
      await q.rollbackTransaction();
      throw err;
    } finally {
      await q.release();
    }
  }

  async update(userId: string, id: string, dto: UpdateAddressDto): Promise<AddressRow> {
    const existing = await this.get(userId, id); // 404 + ownership check

    const q = this.dataSource.createQueryRunner();
    await q.connect();
    await q.startTransaction();
    try {
      if (dto.isDefault === true) {
        await q.query(`UPDATE customer_addresses SET is_default = false WHERE user_id = $1`, [userId]);
      }
      // Refuse to unset the default on the only/default address
      const willBeDefault = dto.isDefault === true ? true : dto.isDefault === false ? false : existing.isDefault;
      const defaults = await q.query(
        `SELECT COUNT(*)::int AS n FROM customer_addresses WHERE user_id = $1 AND is_default = true AND id != $2`,
        [userId, id],
      );
      if (!willBeDefault && defaults[0].n === 0) {
        throw new BadRequestException('At least one address must be the default');
      }

      const sets: string[] = [];
      const params: any[] = [];
      let i = 1;
      const map: Record<string, string> = {
        fullName: 'full_name',
        mobile: 'mobile',
        addressLine1: 'address_line1',
        addressLine2: 'address_line2',
        landmark: 'landmark',
        city: 'city',
        state: 'state',
        pincode: 'pincode',
        addressType: 'address_type',
        isDefault: 'is_default',
      };
      for (const [key, col] of Object.entries(map)) {
        const val = (dto as any)[key];
        if (val !== undefined) {
          sets.push(`${col} = $${i++}`);
          params.push(typeof val === 'string' && key !== 'mobile' && key !== 'pincode' ? val.trim() : val);
        }
      }
      if (!sets.length) {
        await q.rollbackTransaction();
        return existing;
      }
      sets.push(`updated_at = NOW()`);
      params.push(id);

      const [row] = await q.query(
        `UPDATE customer_addresses SET ${sets.join(', ')} WHERE id = $${i} RETURNING ${SELECT_COLS}`,
        params,
      );
      await q.commitTransaction();
      return toApi(row);
    } catch (err) {
      await q.rollbackTransaction();
      throw err;
    } finally {
      await q.release();
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.get(userId, id); // 404 + ownership check

    const q = this.dataSource.createQueryRunner();
    await q.connect();
    await q.startTransaction();
    try {
      await q.query(`DELETE FROM customer_addresses WHERE id = $1`, [id]);
      // If we deleted the default, promote the most recent remaining address
      if (existing.isDefault) {
        await q.query(
          `UPDATE customer_addresses SET is_default = true
           WHERE id = (
             SELECT id FROM customer_addresses WHERE user_id = $1
             ORDER BY created_at DESC LIMIT 1
           )`,
          [userId],
        );
      }
      await q.commitTransaction();
    } catch (err) {
      await q.rollbackTransaction();
      throw err;
    } finally {
      await q.release();
    }
  }
}
