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
    });

    describe('Mongoose non-cascade tree', () => {
        beforeAll(async () => {
            treeSchema.plugin(ChildReferenceTreePlugin);
            Tree = mongoose.model('Tree', treeSchema);
        })

        /**
         * Initialize database with following structure
         *     A
         *   / | \
         *  B  C  D
         *      \   
         *       E 
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
        });

        describe('Find', () => {
            it('should find node with name', async () => {
                const nodeA = await Tree.findOne({ name: 'A' });
                expect(nodeA).toBeDefined();
                expect(nodeA.name).toEqual('A');
                expect(nodeA.children).toHaveLength(3);

                const nodeB = await Tree.findOne({ name: 'B' });
                expect(nodeB).toBeDefined();
                expect(nodeB.name).toEqual('B');
                expect(nodeB.children).toHaveLength(0);
            });

            it('should not found node with name', async () => {
                const node = await Tree.findOne({ name: 'Hello' });
                expect(node).toBeNull();
            })
        });

        describe('Add', () => {
            /**
             * Expect with following structure
             *       A
             *     / | \
             *    B  C  D
             *   /   | 
             *  F    E
             */
            it('should add child after B', async () => {
                // TODO: I will change the way to add child later
                const newNode = new Tree({ name: 'F' });
                let root = await Tree.findOne({ name: 'A' });
                root.children.push(newNode._id);
                newNode.save();
                root = await root.save();
                expect(root.children).toHaveLength(4);
            });
        });

        describe('Update', () => {
            /**
             * Expect with following structure
             *    A
             *   / \
             *  B   C 
             *       \
             *        E 
             */
            it('should remove pop element', async () => {
                let root = await Tree.findOne({ name: 'A' });
                root.children.pop();
                root = await root.save();
                expect(root.children).toHaveLength(2);
            });
        });

        describe('Delete', () => {
            /**
             * Expect with following structure
             *     A
             *   / | \
             *  B  C  D
             */
            it('should remove leaf element', async () => {
                await Tree.remove({ name: 'E' });
                const deleteNode = await Tree.findOne({ name: 'E' });
                expect(deleteNode).toBeNull();
                const nodeC = await Tree.findOne({ name: 'C' });
                expect(nodeC.children).toHaveLength(0);
            });

            /**
             * Expect with following structure
             *     A
             *   / | \
             *  B  E  D
             */
            it('should remove non-lead element while preserve child', async () => {
                let root = await Tree.findOne({ name: 'A' });
                expect(root.children).toHaveLength(3);
                await Tree.remove({ name: 'C' });
                root = await Tree.findOne({ name: 'A' });
                expect(root.children).toHaveLength(3);
                const nodeB = await Tree.findById(root.children[0]);
                const nodeE = await Tree.findById(root.children[1]);
                const nodeD = await Tree.findById(root.children[2]);
                expect(nodeB).toBeDefined();
                expect(nodeB.name).toEqual('B');
                expect(nodeE).toBeDefined();
                expect(nodeE.name).toEqual('E');
                expect(nodeD).toBeDefined();
                expect(nodeD.name).toEqual('D');
            });
        });
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
