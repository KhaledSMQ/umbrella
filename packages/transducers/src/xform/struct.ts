import { StructField, Transducer } from "../api";
import { comp } from "../func/comp";
import { mapKeys } from "./map-keys";
import { partition } from "./partition";
import { partitionOf } from "./partition-of";
import { rename } from "./rename";

/**
 * Higher-order transducer to converts linear input into structured objects
 * using given field specs and ordering. A single field spec is an array of
 * 2 or 3 items: `[name, size, transform?]`. If `transform` is given, it will
 * be used to produce the final value for this field. In the example below,
 * it is used to unwrap the ID field values, e.g. from `[123] => 123`
 *
 * ```
 * tx.transduce(
 *     tx.struct([["id", 1, (id) => id[0]], ["pos", 2], ["vel", 2], ["color", 4]]),
 *     tx.push(),
 *     [0, 100, 200, -1, 0, 1, 0.5, 0, 1, 1, 0, 0, 5, 4, 0, 0, 1, 1]
 * )
 * // [ { color: [ 1, 0.5, 0, 1 ],
 * //     vel: [ -1, 0 ],
 * //     pos: [ 100, 200 ],
 * //     id: 0 },
 * //   { color: [ 0, 0, 1, 1 ],
 * //     vel: [ 5, 4 ],
 * //     pos: [ 0, 0 ],
 * //     id: 1 } ]
 * ```
 *
 * @param fields
 */
export function struct<T>(fields: StructField[]): Transducer<any, T> {
    return comp(
        partitionOf(fields.map((f) => f[1])),
        partition(fields.length),
        rename(fields.map((f) => f[0])),
        mapKeys(fields.reduce((acc, f) => (f[2] ? (acc[f[0]] = f[2], acc) : acc), {}), false)
    );
}
