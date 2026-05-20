const Short = require ("../models/Short");

exports.getShorts = async (req, res) => {
    res.json(await Short.find().sort({ createdAt: -1 }));
};

exports.addShort = async (req, res) => {
  const { youtubeId, title } = req.body;
  if (!youtubeId) return res.status(400).json({ message: "youtubeId is required" });
  const short = await Short.create({ youtubeId, title: title || "" });
  res.status(201).json(short);
};

exports.updateShort = async (req, res) => {
  const short = await Short.findById(req.params.id);
  if (!short) return res.status(404).json({ message: "Short not found" });

  if (typeof req.body.youtubeId === "string") short.youtubeId = req.body.youtubeId;
  if (typeof req.body.title === "string") short.title = req.body.title;
  await short.save();
  res.json(short);
};

exports.deleteShort = async (req, res) => {
  const short = await Short.findById(req.params.id);
  if (!short) return res.status(404).json({ message: "Short not found" });
  await short.deleteOne();
  res.json({ success: true });
};
