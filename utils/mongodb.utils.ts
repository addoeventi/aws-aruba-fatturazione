export class MongoDbUtils {
    static parseFields(fields: string, exclude_properties: string[] = []) {
        fields = (fields || "-__v").replace(/,/g, ' ');
        let mdb_fields: any = {};
        for (let f of fields.split(" ")) {
            let add = 1;
            if (f[0] == '-') {
                f = f.slice(1, f.length);
                add = 0;
            }
            if (f[0] == '+') {
                f = f.slice(1, f.length);
                add = 1;
            }
            mdb_fields[f] = (exclude_properties || []).indexOf(f) > -1 ? 0 : add;
        }
        return mdb_fields;
    }

    static parseOrderBy(fields: string, exclude_properties: string[] = []) {
        fields = (fields || "-__v").replace(/,/g, ' ');
        let mdb_fields: any = {};
        for (let f of fields.split(" ")) {
            let add = 1;
            if (f[0] == '-') {
                f = f.slice(1, f.length);
                add = -1;
            }
            if (f[0] == '+') {
                f = f.slice(1, f.length);
                add = 1;
            }
            mdb_fields[f] = (exclude_properties || []).indexOf(f) > -1 ? 1 : add;
        }
        return mdb_fields;
    }
}