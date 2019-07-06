import ChildReferenceTreePlugin from '../lib';
import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';
import { ChildRefDocument } from '../lib/interface';
import { mock } from 'sinon';
import 'sinon-mongoose';
interface TreeDocument extends ChildRefDocument {
    name: string;
}

describe('Mongoose child reference tree plugin', () => {
    const TreeSchema = new Schema({
        name: String,
    });
    // TODO: register plugin with mongoose schema
    // TreeSchema.plugin(ChildReferenceTreePlugin);
    const Tree = mongoose.model<TreeDocument>('Tree', TreeSchema);
    const TreeMock = mock(Tree);

    it('should be defined', () => {
        expect(ChildReferenceTreePlugin).toBeDefined();
    });

    it('should find all element', async () => {
        TreeMock.expects('find').withArgs({}).resolves([]);
        const trees = await Tree.find({});
        TreeMock.verify();
        TreeMock.restore();
        expect(trees.length).toEqual(0);
    });
});
