import { IObjectOf } from "@thi.ng/api/api";
import { getter } from "@thi.ng/atom/path";
import * as svg from "@thi.ng/hiccup-dom-components/svg";
import { iterator } from "@thi.ng/transducers/iterator";
import { pairs } from "@thi.ng/transducers/iter/pairs";
import { map } from "@thi.ng/transducers/xform/map";

import { EdgeFn, Node, NodeOpts, Port, PortOpts, PortSymbolFn, Graph, GraphOpts } from "./api";

export function portPosition(npos: number[], ports: IObjectOf<Port>, id: string, opts: PortOpts) {
    const idx = ports[id].order !== undefined ? ports[id].order : Object.keys(ports).indexOf(id);
    return [
        npos[0] + opts.pos[0] + idx * opts.step[0],
        npos[1] + opts.pos[1] + idx * opts.step[1]
    ];
}

export function bezierEdgeH(offset = 0, curvature = 0.5) {
    return ([ax, ay], [bx, by]) => {
        const dx = bx - ax;
        const dy = by - ay;
        const dxo = dx - 2 * offset;
        return [
            "path",
            {
                d: offset > 0 ?
                    `M${ax},${ay}l${offset},0c${dxo * curvature},0,${dxo * (1 - curvature)},${dy},${dxo},${dy}l${offset},0` :
                    `M${ax},${ay}c${dx * curvature},0,${dx * (1 - curvature)},${dy},${dx},${dy}`,
            }
        ];
    };
}

export function linearEdgeH(offset = 0) {
    return offset > 0 ?
        ([ax, ay], [bx, by]) =>
            svg.polyline(
                [[ax, ay], [ax + offset, ay], [bx - offset, by], [bx, by]]
            ) :
        (a, b) => svg.polyline([a, b]);
}

export function edges(nodes: IObjectOf<Node>, opts: NodeOpts, edgeFn: EdgeFn) {
    const edges = [];
    for (let id in nodes) {
        const node = nodes[id];
        const nedges = node.edges;
        for (let pid in nedges) {
            const e = nedges[pid];
            if (e) {
                edges.push(
                    edgeFn(
                        portPosition(nodes[e[0]].pos, nodes[e[0]].outs, e[1], opts.outs),
                        portPosition(node.pos, node.ins, pid, opts.ins)
                    )
                );
            }
        }
    }
    return edges;
}

export function portSymbol(sym: PortSymbolFn) {
    return (p: Port, id: string, x: number, y: number, lx: number, ly: number, opts: PortOpts) =>
        svg.group(
            { class: `port port-${p.type}` },
            sym(x, y),
            svg.text(p.label || id, [lx, ly])
        );
}

export const portSymbolDot = portSymbol((x, y) => svg.circle([x, y], 3));
export const portSymbolArrowIn = portSymbol((x, y) => ["path", { d: `M${x - 3},${y}l3,-3,3,0,0,6,-3,0z` }]);
export const portSymbolArrowOut = portSymbol((x, y) => ["path", { d: `M${x + 3},${y}l-3,-3,-3,0,0,6,3,0z` }]);

export function port(ports: IObjectOf<Port>, opts: PortOpts) {
    const [x, y] = opts.pos;
    const [sx, sy] = opts.step;
    const [lx, ly] = opts.labelOffset;
    return (id, i) => {
        const port = ports[id];
        if (!port.hidden) {
            i = port.order !== undefined ? port.order : i;
            const xx = x + i * sx;
            const yy = y + i * sy;
            return (opts.symbol || portSymbolDot)(port, id, xx, yy, xx + lx, yy + ly, opts);
        }
    };
}

export function portGroup(ports: IObjectOf<Port>, opts: PortOpts) {
    return svg.group(
        opts.attribs || {},
        ...Object.keys(ports).map(port(ports, opts))
    );
}

export function nodeLabel(node: Node, opts: NodeOpts) {
    return [svg.text(node.label, opts.label.offset, opts.label.attribs)];
}

export function nodeValueLabel(path: string | string[]) {
    const get = getter(path);
    return (node: Node, opts: NodeOpts) => {
        const val = get(node);
        return [
            svg.text(
                (val != null ? val : "n/a").toString(),
                opts.label.offset,
                opts.label.attribs
            )
        ];
    };
}

export function nodeEvents(id: string, events: any) {
    return Object.keys(events).reduce((acc, e) => (acc[e] = events[e](id), acc), {});
}

export function node(node: Node, opts: NodeOpts) {
    return svg.group(
        {
            id: node.id,
            class: `node node-${node.type}`,
            transform: `translate(${node.pos[0]} ${node.pos[1]})`,
            ...nodeEvents(node.id, opts.events),
            ...opts.attribs,
        },
        svg.rect(
            [0, 0],
            opts.width || Math.max(
                Object.keys(node.ins).length * opts.ins.step[0] + opts.ins.pos[0],
                Object.keys(node.outs).length * opts.outs.step[0] + opts.outs.pos[0]
            ),
            opts.height || Math.max(
                Object.keys(node.ins).length * opts.ins.step[1] + opts.ins.pos[1],
                Object.keys(node.outs).length * opts.outs.step[1] + opts.outs.pos[1]
            ),
            { rx: 4 },
        ),
        portGroup(node.ins, opts.ins),
        portGroup(node.outs, opts.outs),
        ...(node.body ? node.body : nodeLabel)(node, opts),
    );
}

export function nodeGraph(graph: Graph, opts: GraphOpts) {
    return svg.svgdoc(
        opts.attribs,
        opts.defs,
        svg.group(
            { transform: `translate(${opts.pos[0]}, ${opts.pos[1]}) scale(${opts.scale})` },
            svg.group(
                opts.edgeAttribs,
                ...edges(graph.nodes, opts.nodes, opts.edgeFn)
            ),
            ...iterator(map((n) => node(n[1], opts.nodes)), pairs(graph.nodes)),
        )
    );
}