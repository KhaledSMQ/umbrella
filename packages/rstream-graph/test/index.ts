import { Atom } from "@thi.ng/atom";
import * as rs from "@thi.ng/rstream";
import { map } from "@thi.ng/transducers/xform/map";
import * as assert from "assert";

import * as rsg from "../src";

describe("rstream-graph", () => {
    it("basic", (done) => {
        const acc = [];
        const state = new Atom({ a: 1, b: 2 });
        const graph = rsg.initGraph(state, {
            foo: () => ({
                node: rs.fromIterable([2]),
                ins: {},
                outs: {}
            }),
            bar: ($) => ({
                node: $("/foo/node").transform(map((x: number) => x * 10)),
                ins: {},
                outs: {}
            }),
            add: {
                fn: rsg.add,
                ins: {
                    a: { path: "a" },
                    b: { path: "b" }
                },
                outs: {
                    alt: (n) => n.subscribe({}) // identical to main out, testing only
                }
            },
            mul: {
                fn: rsg.mul,
                ins: {
                    a: { stream: "/add/outs/alt" },
                    b: { stream: () => rs.fromIterable([10, 20, 30]) },
                    c: { stream: "/bar/node" }
                },
                outs: {
                    baz: (n, id) => n.subscribe({ next: (x) => state.resetIn(["foo", id], x) })
                }
            },
            res: {
                ins: {
                    src: { stream: "/mul/node" }
                },
                fn: rsg.node1(map((x: number) => ({ x: x, x2: x * 2 }))),
                outs: {
                    "*": "res"
                }
            },
            res2: {
                ins: {
                    src: { stream: "/res/node" }
                },
                fn: rsg.node1(),
                outs: {
                    x: "res2.x",
                }
            }
        });
        graph.mul.node.subscribe({ next: (x) => acc.push(x) });
        setTimeout(() => {
            state.resetIn("a", 10);
            // console.log(graph);
            assert.deepEqual(acc, [600, 1200, 1800, 7200]);
            assert.deepEqual(
                state.deref(),
                { a: 10, b: 2, foo: { baz: 7200 }, res: { x: 7200, x2: 14400 }, res2: { x: 7200 } }
            );
            done();
        }, 30);
    });
});
