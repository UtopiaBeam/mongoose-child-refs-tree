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
        await mongoose.connect('mongodb://localhost:27017/mongoose-child-ref', { useNewUrlParser: true });
        treeSchema.plugin(ChildReferenceTreePlugin);
        Tree = mongoose.model('Tree', treeSchema);
    });

    /**
     * Initialize database with following structure
     *    A
     *  / | \
     * B  C  D
     *     \   
     *      E 
     */
    beforeEach(async () => {
        await Tree.deleteMany({});
        let e = new Tree({ name: 'E' });
        let b = new Tree({ name: 'B' });
        let c = new Tree({ name: 'C', children: [e._id] });
        let d = new Tree({ name: 'D' });
        let a = new Tree({ name: 'A', children: [b._id, c._id, d._id] });
        await a.save();
        await b.save();
        await c.save();
        await d.save();
        await e.save();
    });

    describe('Initial condition', () => {
        it('should have 5 elements', async () => {
            const elementCount = await Tree.count({});
            expect(elementCount).toBe(5);
        });
    })

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
