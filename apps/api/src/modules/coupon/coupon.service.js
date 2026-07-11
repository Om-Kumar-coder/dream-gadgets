var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, NotFoundException, ConflictException, } from '@nestjs/common';
let CouponService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CouponService = _classThis = class {
        constructor(couponRepo) {
            this.couponRepo = couponRepo;
        }
        // ─── Create coupon ───────────────────────────────────────────────────────────
        async create(dto, userId) {
            const existing = await this.couponRepo.findOne({ where: { code: dto.code.toUpperCase() } });
            if (existing) {
                throw new ConflictException({
                    code: 'COUPON_CODE_EXISTS',
                    message: `A coupon with code "${dto.code}" already exists`,
                });
            }
            const coupon = this.couponRepo.create({
                ...dto,
                code: dto.code.toUpperCase(),
                type: dto.type,
                startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                createdById: userId,
            });
            return this.couponRepo.save(coupon);
        }
        // ─── List coupons ────────────────────────────────────────────────────────────
        async findAll(query) {
            const { page = 1, limit = 20, search, type, isActive } = query;
            const qb = this.couponRepo.createQueryBuilder('c')
                .orderBy('c.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (search) {
                qb.andWhere('(c.code ILIKE :search OR c.description ILIKE :search)', { search: `%${search}%` });
            }
            if (type) {
                qb.andWhere('c.type = :type', { type });
            }
            if (isActive !== undefined) {
                qb.andWhere('c.isActive = :isActive', { isActive: isActive === 'true' });
            }
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
        // ─── Find by ID ──────────────────────────────────────────────────────────────
        async findById(id) {
            const coupon = await this.couponRepo.findOne({ where: { id } });
            if (!coupon)
                throw new NotFoundException(`Coupon ${id} not found`);
            return coupon;
        }
        // ─── Update coupon ───────────────────────────────────────────────────────────
        async update(id, dto) {
            const coupon = await this.findById(id);
            if (dto.code && dto.code.toUpperCase() !== coupon.code) {
                const existing = await this.couponRepo.findOne({ where: { code: dto.code.toUpperCase() } });
                if (existing) {
                    throw new ConflictException({
                        code: 'COUPON_CODE_EXISTS',
                        message: `A coupon with code "${dto.code}" already exists`,
                    });
                }
            }
            Object.assign(coupon, {
                ...dto,
                code: dto.code ? dto.code.toUpperCase() : coupon.code,
                startsAt: dto.startsAt ? new Date(dto.startsAt) : coupon.startsAt,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : coupon.expiresAt,
            });
            return this.couponRepo.save(coupon);
        }
        // ─── Toggle active ──────────────────────────────────────────────────────────
        async toggleActive(id) {
            const coupon = await this.findById(id);
            coupon.isActive = !coupon.isActive;
            return this.couponRepo.save(coupon);
        }
        // ─── Delete coupon ──────────────────────────────────────────────────────────
        async remove(id) {
            const coupon = await this.findById(id);
            await this.couponRepo.remove(coupon);
        }
        // ─── Validate coupon against a cart ─────────────────────────────────────────
        async validate(dto) {
            const code = dto.code.toUpperCase();
            const coupon = await this.couponRepo.findOne({ where: { code } });
            if (!coupon) {
                return { valid: false, message: 'Invalid coupon code' };
            }
            if (!coupon.isActive) {
                return { valid: false, message: 'This coupon is no longer active' };
            }
            // Check usage limit
            if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
                return { valid: false, message: 'This coupon has reached its usage limit' };
            }
            // Note: per-user limit check requires a coupon_usage table to track which user
            // used which coupon. This is a future enhancement — for now, the usageLimit
            // (total uses across all users) is enforced via usedCount.
            // Check date validity
            const now = new Date();
            if (coupon.startsAt && now < coupon.startsAt) {
                return { valid: false, message: 'This coupon is not yet valid' };
            }
            if (coupon.expiresAt && now > coupon.expiresAt) {
                return { valid: false, message: 'This coupon has expired' };
            }
            // Check minimum order amount
            if (dto.subtotal < Number(coupon.minOrderAmount)) {
                return {
                    valid: false,
                    message: `Minimum order amount of ₹${Number(coupon.minOrderAmount).toLocaleString('en-IN')} required`,
                };
            }
            // Calculate discount
            let discount = 0;
            switch (coupon.type) {
                case 'percentage': {
                    discount = (dto.subtotal * Number(coupon.value)) / 100;
                    if (coupon.maxDiscount) {
                        discount = Math.min(discount, Number(coupon.maxDiscount));
                    }
                    break;
                }
                case 'fixed_amount': {
                    discount = Number(coupon.value);
                    break;
                }
                case 'free_shipping': {
                    // For now, treat as a fixed discount estimate
                    discount = 0; // Shipping cost is calculated separately
                    break;
                }
                case 'bogo': {
                    // BOGO is handled at the item level — no automatic discount here
                    discount = 0;
                    break;
                }
            }
            return {
                valid: true,
                coupon,
                discount: Math.round(discount * 100) / 100,
                message: `Coupon "${coupon.code}" applied! You saved ₹${Math.round(discount).toLocaleString('en-IN')}`,
            };
        }
        // ─── Increment usage count (called when a sale uses this coupon) ────────────
        async recordUsage(code) {
            await this.couponRepo.increment({ code: code.toUpperCase() }, 'usedCount', 1);
        }
    };
    __setFunctionName(_classThis, "CouponService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CouponService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CouponService = _classThis;
})();
export { CouponService };
//# sourceMappingURL=coupon.service.js.map