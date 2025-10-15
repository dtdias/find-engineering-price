const mongoose = require('mongoose');
const { Schema } = mongoose;

const compositionItemSchema = new Schema({
  type: Schema.Types.String,
  code: Schema.Types.String,
  description: Schema.Types.String,
  unit: Schema.Types.String,
  price: Schema.Types.String,
  pendencies: Schema.Types.String,
  technicalNotebook: Schema.Types.String
})

const compositionSchema = new Schema({
  code: Schema.Types.String,
  database: Schema.Types.String,
  macro: {
    num: Schema.Types.String,
    name: Schema.Types.String,
  },
  group: {
    num: Schema.Types.String,
    name: Schema.Types.String
  },
  description: Schema.Types.String,
  unit: Schema.Types.String,
  technicalNotebook: Schema.Types.String,
  lastUpdate: Schema.Types.String,
  costCondition: Schema.Types.String,
  children: [{ type: Schema.Types.ObjectId, ref: 'CompositionItem' }]
})

const Composition = mongoose.model('Composition', compositionSchema);
const CompositionItem = mongoose.model('CompositionItem', compositionItemSchema);

const supplySchema = new Schema({
  code: Schema.Types.String,
  database: Schema.Types.String,
  description: Schema.Types.String,
  unit: Schema.Types.String,
  costCondition: Schema.Types.String,
  category: Schema.Types.String,
  nbr: Schema.Types.String,
})

const Supply = mongoose.model('Supply', supplySchema)

const BudgetSchema = new Schema({
  name: Schema.Types.String,
  enterpriseId: Schema.Types.String,
  code: Schema.Types.String,
  workName: Schema.Types.String,
  bdi: Schema.Types.Number,
  model: Schema.Types.Boolean,
  status: Schema.Types.String,
  compositions: [{ source: { type: Schema.Types.ObjectId, ref: 'Composition' }, childPrices: [{ id: Schema.Types.String, price: Schema.Types.Number, quantity: Schema.Types.Number }] }],
  supplies: [{ source: { type: Schema.Types.ObjectId, ref: 'Supply' }, quantity: Schema.Types.Number, price: Schema.Types.Number },]
})

const Budget = mongoose.model('Budget', BudgetSchema)

exports.Composition = Composition;
exports.CompositionItem = CompositionItem;
exports.Supply = Supply;
exports.Budget = Budget;
exports.mongoose = mongoose;

exports.mongoose = mongoose.connect(process.env.MONGO_URL ?? 'mongodb+srv://pormil.ifhyhiu.mongodb.net/?retryWrites=true&w=majority&appName=pormil', { auth: { username: 'dev', password: 'LigQvhZtW1F5pI4I' } }).then(async (mongoose) => {
  try {
    if (!Composition.collection.collection) {
      await Composition.createCollection()
      await Composition.createIndexes({
        code: 1,
        description: 1
      })
    }

    if (!CompositionItem.collection.collection) {
      await CompositionItem.createCollection()
      await CompositionItem.createIndexes({
        code: 1,
        description: 1
      })
    }
    return mongoose;
  } catch (error) {
    console.error(error)
  }
});
