import ChatInterface from "@/components/chat-interface";

export default function ChatbotPage() {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">Agri Assistant - Your Farming Expert</h2>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Get instant answers to your agricultural questions. Our AI-powered assistant provides information on farming techniques, crop diseases, and market trends.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ChatInterface initialQuestion={null} />
        </div>
      </div>
    </section>
  );
}
