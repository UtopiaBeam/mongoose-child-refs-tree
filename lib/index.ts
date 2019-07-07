import { Schema, HookNextFunction, Collection } from 'mongoose';
import { Options, ChildRefDocument } from './interface';

/**
 * Main plugin method
 * @param  {Schema} schema  Mongoose Schema
 * @param  {Object} options [description]
 */
function mongooseChildRef(schema: Schema, options: Options): Schema {
    const cascade: boolean = (options && options.cascade) || false;

    schema.add({
        children: [Schema.Types.ObjectId],
    });

    schema.pre<ChildRefDocument>('remove', function(next: HookNextFunction) {
        if (!this.children) {
            return next();
        }
        if (cascade === true) {
            this.collection.deleteMany({ _id: { $in: this.children } }, next);
        }
    });

    return schema;
}

export default mongooseChildRef;
