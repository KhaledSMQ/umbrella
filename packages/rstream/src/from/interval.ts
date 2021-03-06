import { Stream } from "../stream";
import { Subscription } from "../subscription";

/**
 * Returns a new `Stream` which emits a monotonically increasing counter
 * value at given `delay` interval, up to an optionally defined max
 * value (default: ∞), after which the stream is closed. The stream only
 * starts when the first subscriber becomes available.
 *
 * @param delay
 * @param count
 */
export function fromInterval(delay: number, count = Infinity) {
    return new Stream<number>((stream) => {
        let i = 0;
        stream.next(i++);
        let id = setInterval(() => {
            stream.next(i++);
            if (--count <= 0) {
                clearInterval(id);
                stream.done();
            }
        }, delay);
        return () => clearInterval(id);
    }, `interval-${Subscription.NEXT_ID++}`);
}
