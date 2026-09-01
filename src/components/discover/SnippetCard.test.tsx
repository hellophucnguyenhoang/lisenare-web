import SnippetCard from "./SnippetCard";

const sampleSnippet = {
  id: 323,
  content: "Can you recommend a good local restaurant?",
  translation: "Bạn có thể giới thiệu một nhà hàng địa phương ngon không?",
  contentAudioPath: "snippets-audios/cv-valid-test/sample-000322.mp3",
  contentPron: "/kæn juː ˌrɛkəˈmɛnd ə ɡʊd ˈloʊkəl ˈrɛstərənt/",
  context:
    "Great icebreaker for asking hotel concierges, taxi drivers, or locals for authentic dining spots off the tourist path.",
  isPublic: true,
  lastEditAt: "2026-08-17T21:54:13.268384+07:00",
  creator: {
    id: 1,
    name: "The Avid Learner",
  },
  reaction: null,
  contributionCount: 0,
  tags: ["Food", "Dining"],
};

export default function SnippetCardTest() {
  return (
    <SnippetCard
      snippet={sampleSnippet}
      onOpenContributions={(snippet) =>
        console.log(`Studying: ${snippet.content}`)
      }
      onOpenSaveModal={(snippet) => console.log(`Studying: ${snippet.content}`)}
    />
  );
}
