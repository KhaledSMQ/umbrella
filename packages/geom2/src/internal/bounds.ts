import {
    addNew,
    max,
    min,
    ReadonlyVec,
    sub,
    Vec
} from "@thi.ng/vectors2/api";
import { bounds as _bounds, IShape, union } from "../api";

export const bounds =
    (pts: ReadonlyArray<Vec>, vmin: Vec, vmax: Vec): [Vec, Vec] => {

        for (let i = pts.length; --i >= 0;) {
            const p = pts[i];
            min(vmin, p);
            max(vmax, p);
        }
        return [vmin, vmax];
    };

export const collBounds =
    (shapes: IShape[]) => {

        let n = shapes.length - 1;
        let res: IShape = n >= 0 ? _bounds(shapes[n]) : undefined;
        for (; --n >= 0;) {
            res = union(res, _bounds(shapes[n]))[0];
        }
        return res;
    };

export const unionBounds =
    (pos1: ReadonlyVec, size1: ReadonlyVec, pos2: ReadonlyVec, size2: ReadonlyVec): [Vec, Vec] => {
        const p = addNew(pos1, size1);
        const q = addNew(pos2, size2);
        const pos = min([...pos1], pos2);
        return [pos, sub(max(p, q), pos)];
    };