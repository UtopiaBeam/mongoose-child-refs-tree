import ChildReferenceTreePlugin from '../lib';
import * as mongoose from 'mongoose';
import { ChildRefDocument } from '../lib/interface';
interface TreeDocument extends ChildRefDocument {
    name: string;
}

describe('Plugin existence', () => {
    it('should be defined', () => {
        expect(ChildReferenceTreePlugin).toBeDefined();
    });
});

describe('Mongoose child reference tree plugin function', () => {

    const treeSchema = new mongoose.Schema({
        name: String,
    });
    let Tree: mongoose.Model<TreeDocument>;

    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/seating-backend', { useNewUrlParser: true });
        treeSchema.plugin(ChildReferenceTreePlugin);
        Tree = mongoose.model('Tree', treeSchema);
    });

    describe('Database connection', () => {
        it('should connect to database', () => {
            expect(mongoose.connection.readyState).toBe(1);
        });
    });

    describe('Plugin initialization', () => {
        it('should have children field', () => {
            expect(Tree.schema.path('children').get).toBeDefined();
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
});
