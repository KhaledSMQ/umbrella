import { vop } from "./internal/vop";
import { MultiVecOpRoVVO, ReadonlyVec } from "./api";
import { EPS } from "@thi.ng/math/api";
import { eqDelta as _eq } from "@thi.ng/math/eqdelta";
import { implementsFunction } from "@thi.ng/checks/implements-function";
import { compileHOF } from "./internal/codegen";

const $ = (dim) =>
    eqDelta.add(
        dim,
        compileHOF(
            dim,
            [_eq, EPS],
            ([a, b]) => `eq(${a},${b},eps)`,
            "eq,_eps",
            "a,b,eps=_eps",
            "a,b",
            null,
            "&&",
            "return a.length === b.length && ",
            ";"
        )
    );

export const eqDelta: MultiVecOpRoVVO<boolean, number> = vop();

eqDelta.default(
    (v1, v2, eps = EPS) => {
        if (implementsFunction(v1, "eqDelta")) {
            return (<any>v1).eqDelta(v2, eps);
        }
        if (implementsFunction(v2, "eqDelta")) {
            return (<any>v2).eqDelta(v1, eps);
        }
        return eqDeltaS(v1, v2, v1.length, eps);
    }
);

export const eqDelta2 = $(2);
export const eqDelta3 = $(3);
export const eqDelta4 = $(4);

/**
 * Similar to `equiv()`, but takes tolerance `eps` into account for
 * equality checks.
 *
 * @param a first vector
 * @param b second vector
 * @param n number of elements
 * @param eps tolerance
 * @param ia start index a
 * @param ib start index b
 * @param sa stride a
 * @param sb stride b
 */
export const eqDeltaS = (
    a: ReadonlyVec,
    b: ReadonlyVec,
    n: number,
    eps = EPS,
    ia = 0,
    ib = 0,
    sa = 1,
    sb = 1) => {

    for (; n > 0; n-- , ia += sa, ib += sb) {
        if (!_eq(a[ia], b[ib], eps)) {
            return false;
        }
    }
    return true;
};