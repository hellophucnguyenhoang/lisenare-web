import BrickCard from "./BrickCard";

const sampleBrick = {
  nativeText:
    "Cuộc chiến khốc liệt nhất là cuộc chiến giữa trái tim và lý trí, bạn không bao giờ biết nên nghe theo cái nào.",
  targetText:
    "The worst battle is the one that goes on between your heart and your mind, you never know which one to listen to.",
  targetPron: "/ðə bɪl pliːz/",
  context: "No context hehe",
  kind: "sentence",
  isPrivate: true,
  id: 10247,
  targetAudioPath: "brick-audios/aWTrDkYdxK4_sentence_252.wav",
  lastEditAt: "2026-08-12T22:36:12.254475+07:00",
  creatorId: 2,
  creator: {
    id: 2,
    name: "Phúc",
  },
  collectionId: 1,
  tags: ["Lesson 1363"],
  learned: false,
};

export default function BrickCardTest() {
  return (
    <BrickCard
      brick={sampleBrick}
      onEditBrick={(id) => console.log("Edit clicked:", id)}
      onDeleteBrick={(id) => alert(`Delete clicked for ${id}`)}
      onStudyBrick={(brick) => console.log("Studying:", brick.targetText)}
    />
  );
}
