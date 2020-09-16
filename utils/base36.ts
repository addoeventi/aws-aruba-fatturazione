export class Base36 {

    private static d36 = [
        Math.pow(36, 10),
        Math.pow(36, 9),
        Math.pow(36, 8),
        Math.pow(36, 7),
        Math.pow(36, 6),
        Math.pow(36, 5),
        Math.pow(36, 4),
        Math.pow(36, 3),
        Math.pow(36, 2),
        Math.pow(36, 1),
        Math.pow(36, 0)
    ];

    /**
     * generates 36 capacity digits string from integer result is string of [0-1A-Z]
     * @param {number} num
     * @returns {string}
     */
    public static int2Str36(num: number) {
        let baseIdx = Base36.d36.length;
        let result = [];
        let empty = null;
        if (num === 0) return '0';
        for (let i = 0; i < baseIdx; i++) {
            let d = Base36.d36[i];
            let c = 0;
            if (d <= num) {
                c = Math.trunc(num / d);
                num -= d * c;
                c = Base36.encodeCharCode2Int36(c);
                empty = Base36.encodeCharCode2Int36(0);
            } else {
                c = empty;
            }
            if (c) result.push(c);
        }
        return String.fromCharCode.apply(null, result);
    }


    /**
     * converts alphanum string of [0-9A-Z] into integer
     * @param {string} str
     * @return {number}
     */
    public static str2Int36(str) {
        const codes = [];
        for (let i = 0; i < str.length; i++) {
            let code = Base36.decodeCharCode2Int36(str.charCodeAt(i));
            if (code !== null) {
                codes.push(code);
            }
        }
        return codes.reverse().reduce((r, v, i) => {
            return r + v * Math.pow(36, i);
        }, 0);
    }

    /**
     * converts 0-35 integer to charCode of [0-9A-Z]
     * @param {number} v
     * @returns {number}
     */
    public static encodeCharCode2Int36(v) {
        return (0 <= v && v < 10) ? (v + 48) : ((10 <= v && v < 36) ? v + 55 : null);
    }

    /**
     * converts charCode of [0-9A-Z] to 0-35 integer
     * @param {number} d
     * @returns {number}
     */
    public static decodeCharCode2Int36(d) {
        return (47 < d && d < 58) ? (d - 48) : ((63 < d && d < 91) ? d - 55 : null);
    }
}


export function randomString(n: number, possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") {
    var text = "";

    for (var i = 0; i < n; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

export function generateCode(n: number, n_random_character: number = 2, possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"): string {
    return Base36.int2Str36(n) + randomString(n_random_character, possibleChars)
}

export class Dateutils {
    static addDays(date: Date, days): Date {
        var date = new Date(date.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    static getDates(startDate: Date, stopDate: Date): Date[] {
        var dateArray: Date[] = new Array();
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            dateArray.push(new Date(currentDate));
            currentDate = Dateutils.addDays(currentDate, 1);
        }
        return dateArray;
    }
}