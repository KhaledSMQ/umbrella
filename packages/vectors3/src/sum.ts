import { MultiVecOpRoV } from "./api";
import { vop } from "./internal/vop";
import { reduce } from "@thi.ng/transducers/reduce";
import { add } from "@thi.ng/transducers/rfn/add";

/**
 * Returns component sum of vector `v`.
 *
 * @param v
 */
export const sum: MultiVecOpRoV<number> = vop(0);

sum.default((v) => reduce(add(), v));

export const sum2 = sum.add(2, (a) => a[0] + a[1]);
export const sum3 = sum.add(2, (a) => a[0] + a[1] + a[2]);
export const sum4 = sum.add(2, (a) => a[0] + a[1] + a[2] + a[3]);