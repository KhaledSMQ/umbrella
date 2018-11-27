import { MultiVecOpV } from "./api";
import { vop } from "./internal/vop";
import { mag } from "./mag";

const sqrt = Math.sqrt;
const asin = Math.asin;
const atan2 = Math.atan2;

/**
 * Converts cartesian vector `v` to polar coordinates. See `cartesian()`
 * for reverse operation. If `out` is null, modifies `v` in place.
 *
 * @param out
 * @param v
 */
export const polar: MultiVecOpV = vop(1);

/**
 * Converts 2D cartesian vector `v` to polar coordinates, i.e. `[r,θ]`
 * (angle in radians). See `cartesian()` for reverse operation. If `out`
 * is null, modifies `v` in place.
 *
 * @param out
 * @param v
 */
export const polar2 = polar.add(2, (out, a) => {
    !out && (out = a);
    const x = a[0];
    out[0] = mag(a);
    out[1] = atan2(a[1], x);
    return out;
});

/**
 * Converts 3D cartesian vector `v` to spherical coordinates, i.e.
 * `[r,θ,ϕ]` (angles in radians). See `cartesian()` for reverse
 * operation. If `out` is null, modifies `v` in place.
 *
 * @param out
 * @param v
 */
export const polar3 = polar.add(3, (out, a) => {
    !out && (out = a);
    const x = a[0];
    const y = a[1];
    const z = a[2];
    const r = sqrt(x * x + y * y + z * z);
    out[0] = r;
    out[1] = asin(z / r);
    out[2] = atan2(y, x);
    return out;
});