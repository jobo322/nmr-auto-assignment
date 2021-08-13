export function getErrorFunction(func, data) {
    return (params) => {
        let y = func(params, data.x);
        let errorValue = 0;
        for (let i = 0; i < data.x.length; i++) {
            errorValue += Math.sqrt(Math.pow(y[i] - data.y[i], 2));
        }
        return errorValue;
    }
}