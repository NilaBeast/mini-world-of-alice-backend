const Short = require ("../models/Short");

exports.getShorts = async (req, res) => {
    res.json(await Short.findAll({ order: [["createdAt", "DESC"]] }));
};

exports.addShort = async (req, res) => {
  const { youtubeId, title } = req.body;
  if (!youtubeId) {
    return res.status(400).json({ message: "youtubeId is required" });
  }

  const short = await Short.create({ youtubeId, title: title || null });
  res.status(201).json(short);
};

exports.updateShort = async (req, res) => {
  const short = await Short.findByPk(req.params.id);
  if (!short) {
    return res.status(404).json({ message: "Short not found" });
  }

  const nextYoutubeId =
    typeof req.body.youtubeId === "string" ? req.body.youtubeId : short.youtubeId;
  const nextTitle = typeof req.body.title === "string" ? req.body.title : short.title;

  await short.update({ youtubeId: nextYoutubeId, title: nextTitle });
  res.json(short);
};

exports.deleteShort = async (req, res) => {
  const deleted = await Short.destroy({ where: { id: req.params.id } });
  if (!deleted) {
    return res.status(404).json({ message: "Short not found" });
  }
  return res.json({ success: true });
};
