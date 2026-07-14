/**
 * Type-level tests for ApiProperty format/type constraints.
 *
 * These tests verify that TypeScript produces errors for invalid combinations.
 * Run: `tsc --noEmit` to verify.
 */
import { ApiProperty } from './api-property';

// ─── ✅ Correct usages (no errors expected) ──────────────────────

class _CorrectUsages {
  // String format — type defaults to String (omitted)
  @ApiProperty({ format: 'uuid' })
  a1!: string;

  // String format — explicit String type
  @ApiProperty({ type: String, format: 'email' })
  a2!: string;

  // String format — all string formats with String type
  @ApiProperty({ type: String, format: 'phone' })
  a3!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  a4!: string;

  @ApiProperty({ type: String, format: 'ipv4' })
  a5!: string;

  @ApiProperty({ type: String, format: 'creditcard' })
  a6!: string;

  // Number format — requires Number type
  @ApiProperty({ type: Number, format: 'latitude' })
  b1!: number;

  @ApiProperty({ type: Number, format: 'longitude' })
  b2!: number;

  @ApiProperty({ type: Number, format: 'float' })
  b3!: number;

  @ApiProperty({ type: Number, format: 'percentage' })
  b4!: number;

  @ApiProperty({ type: Number, format: 'int32' })
  b5!: number;

  @ApiProperty({ type: Number, format: 'int64' })
  b6!: number;

  // Boolean format — requires Boolean type
  @ApiProperty({ type: Boolean, format: 'boolean' })
  c1!: boolean;

  // No format — any type is allowed
  @ApiProperty({ type: String, description: 'no format' })
  d1!: string;

  @ApiProperty({ type: Number, description: 'no format' })
  d2!: number;

  @ApiProperty({ description: 'no format at all' })
  d3!: unknown;

  // Optional field using required: false
  @ApiProperty({ format: 'uuid', required: false })
  e1!: string;

  @ApiProperty({ type: Number, format: 'latitude', required: false })
  e2!: number;
}

// ─── ❌ Invalid usages (TypeScript errors expected) ──────────────

class _InvalidUsages {
  // @ts-expect-error — uuid is StringFormat, type must be String (not Number)
  @ApiProperty({ type: Number, format: 'uuid' })
  x1!: string;

  // @ts-expect-error — latitude is NumberFormat, default type is String (need Number)
  @ApiProperty({ format: 'latitude' })
  x2!: number;

  // @ts-expect-error — percentage is NumberFormat, default type is String (need Number)
  @ApiProperty({ format: 'percentage' })
  x3!: number;

  // @ts-expect-error — float is NumberFormat, type must be Number (not String)
  @ApiProperty({ type: String, format: 'float' })
  x4!: number;

  // @ts-expect-error — email is StringFormat, type must be String (not Number)
  @ApiProperty({ type: Number, format: 'email' })
  x5!: string;

  // @ts-expect-error — boolean is BooleanFormat, type must be Boolean (not String)
  @ApiProperty({ type: String, format: 'boolean' })
  x6!: boolean;
}
