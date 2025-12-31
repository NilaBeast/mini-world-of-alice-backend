const Short = require ("../models/Short");

exports.getShorts = async (req, res) => {
    res.json(await Short.find().sort({ createdAt: -1 }));
};

exports.addShort = async (req, res) => {
     const short = await Short.create(req.body);
  res.json(short);
};

exports.deleteShort = async (req, res) => {
    await Short.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
