import { Reducer } from "../api";

export function compR(rfn: Reducer<any, any>, fn: (acc: any, x: any) => any) {
    return <Reducer<any, any>>[rfn[0], rfn[1], fn];
}
