// The idea is that we will GIVE rust access to JS's date.now function, to call
export function rnd(max) {
    return Math.floor(Math.random() * max);
}
