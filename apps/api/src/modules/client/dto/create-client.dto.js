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
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsDateString, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
let CreateClientDto = (() => {
    var _a;
    let _firstName_decorators;
    let _firstName_initializers = [];
    let _firstName_extraInitializers = [];
    let _lastName_decorators;
    let _lastName_initializers = [];
    let _lastName_extraInitializers = [];
    let _phone_decorators;
    let _phone_initializers = [];
    let _phone_extraInitializers = [];
    let _alternatePhone_decorators;
    let _alternatePhone_initializers = [];
    let _alternatePhone_extraInitializers = [];
    let _email_decorators;
    let _email_initializers = [];
    let _email_extraInitializers = [];
    let _gender_decorators;
    let _gender_initializers = [];
    let _gender_extraInitializers = [];
    let _dateOfBirth_decorators;
    let _dateOfBirth_initializers = [];
    let _dateOfBirth_extraInitializers = [];
    let _address_decorators;
    let _address_initializers = [];
    let _address_extraInitializers = [];
    let _city_decorators;
    let _city_initializers = [];
    let _city_extraInitializers = [];
    let _district_decorators;
    let _district_initializers = [];
    let _district_extraInitializers = [];
    let _state_decorators;
    let _state_initializers = [];
    let _state_extraInitializers = [];
    let _pincode_decorators;
    let _pincode_initializers = [];
    let _pincode_extraInitializers = [];
    let _idProofType_decorators;
    let _idProofType_initializers = [];
    let _idProofType_extraInitializers = [];
    let _idProofNumber_decorators;
    let _idProofNumber_initializers = [];
    let _idProofNumber_extraInitializers = [];
    let _customerType_decorators;
    let _customerType_initializers = [];
    let _customerType_extraInitializers = [];
    let _birthdayOffer_decorators;
    let _birthdayOffer_initializers = [];
    let _birthdayOffer_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _branchId_decorators;
    let _branchId_initializers = [];
    let _branchId_extraInitializers = [];
    return _a = class CreateClientDto {
            constructor() {
                this.firstName = __runInitializers(this, _firstName_initializers, void 0);
                this.lastName = (__runInitializers(this, _firstName_extraInitializers), __runInitializers(this, _lastName_initializers, void 0));
                this.phone = (__runInitializers(this, _lastName_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
                this.alternatePhone = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _alternatePhone_initializers, void 0));
                this.email = (__runInitializers(this, _alternatePhone_extraInitializers), __runInitializers(this, _email_initializers, void 0));
                this.gender = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _gender_initializers, void 0));
                this.dateOfBirth = (__runInitializers(this, _gender_extraInitializers), __runInitializers(this, _dateOfBirth_initializers, void 0));
                this.address = (__runInitializers(this, _dateOfBirth_extraInitializers), __runInitializers(this, _address_initializers, void 0));
                this.city = (__runInitializers(this, _address_extraInitializers), __runInitializers(this, _city_initializers, void 0));
                this.district = (__runInitializers(this, _city_extraInitializers), __runInitializers(this, _district_initializers, void 0));
                this.state = (__runInitializers(this, _district_extraInitializers), __runInitializers(this, _state_initializers, void 0));
                this.pincode = (__runInitializers(this, _state_extraInitializers), __runInitializers(this, _pincode_initializers, void 0));
                this.idProofType = (__runInitializers(this, _pincode_extraInitializers), __runInitializers(this, _idProofType_initializers, void 0));
                this.idProofNumber = (__runInitializers(this, _idProofType_extraInitializers), __runInitializers(this, _idProofNumber_initializers, void 0));
                this.customerType = (__runInitializers(this, _idProofNumber_extraInitializers), __runInitializers(this, _customerType_initializers, void 0));
                this.birthdayOffer = (__runInitializers(this, _customerType_extraInitializers), __runInitializers(this, _birthdayOffer_initializers, void 0));
                this.notes = (__runInitializers(this, _birthdayOffer_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                this.branchId = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _branchId_initializers, void 0));
                __runInitializers(this, _branchId_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _firstName_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _lastName_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _phone_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            _alternatePhone_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _email_decorators = [ApiPropertyOptional(), IsOptional(), IsEmail()];
            _gender_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _dateOfBirth_decorators = [ApiPropertyOptional(), IsOptional(), IsDateString()];
            _address_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _city_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _district_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _state_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _pincode_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _idProofType_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _idProofNumber_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _customerType_decorators = [ApiPropertyOptional(), IsOptional(), IsIn(['walk-in', 'online', 'corporate', 'dealer'])];
            _birthdayOffer_decorators = [ApiPropertyOptional(), IsOptional(), IsBoolean()];
            _notes_decorators = [ApiPropertyOptional(), IsOptional(), IsString()];
            _branchId_decorators = [ApiProperty(), IsString(), IsNotEmpty()];
            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: obj => "firstName" in obj, get: obj => obj.firstName, set: (obj, value) => { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _firstName_extraInitializers);
            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: obj => "lastName" in obj, get: obj => obj.lastName, set: (obj, value) => { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _lastName_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: obj => "phone" in obj, get: obj => obj.phone, set: (obj, value) => { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _alternatePhone_decorators, { kind: "field", name: "alternatePhone", static: false, private: false, access: { has: obj => "alternatePhone" in obj, get: obj => obj.alternatePhone, set: (obj, value) => { obj.alternatePhone = value; } }, metadata: _metadata }, _alternatePhone_initializers, _alternatePhone_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: obj => "email" in obj, get: obj => obj.email, set: (obj, value) => { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _gender_decorators, { kind: "field", name: "gender", static: false, private: false, access: { has: obj => "gender" in obj, get: obj => obj.gender, set: (obj, value) => { obj.gender = value; } }, metadata: _metadata }, _gender_initializers, _gender_extraInitializers);
            __esDecorate(null, null, _dateOfBirth_decorators, { kind: "field", name: "dateOfBirth", static: false, private: false, access: { has: obj => "dateOfBirth" in obj, get: obj => obj.dateOfBirth, set: (obj, value) => { obj.dateOfBirth = value; } }, metadata: _metadata }, _dateOfBirth_initializers, _dateOfBirth_extraInitializers);
            __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: obj => "address" in obj, get: obj => obj.address, set: (obj, value) => { obj.address = value; } }, metadata: _metadata }, _address_initializers, _address_extraInitializers);
            __esDecorate(null, null, _city_decorators, { kind: "field", name: "city", static: false, private: false, access: { has: obj => "city" in obj, get: obj => obj.city, set: (obj, value) => { obj.city = value; } }, metadata: _metadata }, _city_initializers, _city_extraInitializers);
            __esDecorate(null, null, _district_decorators, { kind: "field", name: "district", static: false, private: false, access: { has: obj => "district" in obj, get: obj => obj.district, set: (obj, value) => { obj.district = value; } }, metadata: _metadata }, _district_initializers, _district_extraInitializers);
            __esDecorate(null, null, _state_decorators, { kind: "field", name: "state", static: false, private: false, access: { has: obj => "state" in obj, get: obj => obj.state, set: (obj, value) => { obj.state = value; } }, metadata: _metadata }, _state_initializers, _state_extraInitializers);
            __esDecorate(null, null, _pincode_decorators, { kind: "field", name: "pincode", static: false, private: false, access: { has: obj => "pincode" in obj, get: obj => obj.pincode, set: (obj, value) => { obj.pincode = value; } }, metadata: _metadata }, _pincode_initializers, _pincode_extraInitializers);
            __esDecorate(null, null, _idProofType_decorators, { kind: "field", name: "idProofType", static: false, private: false, access: { has: obj => "idProofType" in obj, get: obj => obj.idProofType, set: (obj, value) => { obj.idProofType = value; } }, metadata: _metadata }, _idProofType_initializers, _idProofType_extraInitializers);
            __esDecorate(null, null, _idProofNumber_decorators, { kind: "field", name: "idProofNumber", static: false, private: false, access: { has: obj => "idProofNumber" in obj, get: obj => obj.idProofNumber, set: (obj, value) => { obj.idProofNumber = value; } }, metadata: _metadata }, _idProofNumber_initializers, _idProofNumber_extraInitializers);
            __esDecorate(null, null, _customerType_decorators, { kind: "field", name: "customerType", static: false, private: false, access: { has: obj => "customerType" in obj, get: obj => obj.customerType, set: (obj, value) => { obj.customerType = value; } }, metadata: _metadata }, _customerType_initializers, _customerType_extraInitializers);
            __esDecorate(null, null, _birthdayOffer_decorators, { kind: "field", name: "birthdayOffer", static: false, private: false, access: { has: obj => "birthdayOffer" in obj, get: obj => obj.birthdayOffer, set: (obj, value) => { obj.birthdayOffer = value; } }, metadata: _metadata }, _birthdayOffer_initializers, _birthdayOffer_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _branchId_decorators, { kind: "field", name: "branchId", static: false, private: false, access: { has: obj => "branchId" in obj, get: obj => obj.branchId, set: (obj, value) => { obj.branchId = value; } }, metadata: _metadata }, _branchId_initializers, _branchId_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CreateClientDto };
//# sourceMappingURL=create-client.dto.js.map