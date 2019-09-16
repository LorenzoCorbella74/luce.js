export default () => {
    
    let listeners = new Map();

    const on = (e, f) => {
        this.listeners.has(e) || this.listeners.set(e, []); // se non c'è si crea un array (di funzioni)
        this.listeners.get(e).push(f); 
    }

    const off = (e, f) => {
        const ls = this.listeners.get(e);
        if (ls && ls.length) {
            ls.forEach((l, i) => {
                if (l === f || l._ === f) {
                    ls.splice(i, 1);
                }
            });
        }
        ls.length ? this.listeners.set(e, ls) : this.listeners.delete(e);
    }

    const emit = (e, ...a) => {
        const ls = this.listeners.get(e);
        if (ls && ls.length) {
            ls.forEach(l => l(...a));
        }
    }

    return { on, off, emit }
}