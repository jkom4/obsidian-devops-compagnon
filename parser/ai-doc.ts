export class AIDocumentationEnhancer {
	settings: any;
	style: string;

	constructor(settings: any, style: string) {
		this.settings = settings;
		this.style = style;
	}

	async enhanceDocumentation(rawDoc: string): Promise<string> {
		const provider = this.settings.preferredProvider;
		let apiKey = "";

		switch (provider) {
			case "openai":
				apiKey = this.settings.openAIKey;
				break;
			case "google":
				apiKey = this.settings.googleAIKey;
				break;
			case "claude":
				apiKey = this.settings.claudeKey;
				break;
			case "mistral":
				apiKey = this.settings.mistralKey;
				break;

		}

		if (!apiKey) {
			console.warn(`⚠️ No API key found for ${provider}. Returning raw documentation.`);
			return rawDoc;
		}

		const prompt = `
You are an expert DevOps documentation assistant.
Rewrite and enhance the following technical documentation in a clear, structured, and ${this.style} style.
Keep all code and technical details, but make explanations easier to understand.

Content:
${rawDoc}
`;

		try {
			let endpoint = "";
			let headers: Record<string, string> = {};
			let body: any = {};

			switch (provider) {
				case "openai":
					endpoint = "https://api.openai.com/v1/chat/completions";
					headers = {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${apiKey}`,
					};
					body = {
						model: "gpt-4o-mini",
						messages: [{ role: "user", content: prompt }],
						max_tokens: 1000,
					};
					break;

				case "claude":
					endpoint = "https://api.anthropic.com/v1/messages";
					headers = {
						"Content-Type": "application/json",
						"x-api-key": apiKey,
					};
					body = {
						model: "claude-3-haiku-20240307",
						messages: [{ role: "user", content: prompt }],
					};
					break;

				case "mistral":
					endpoint = "https://api.mistral.ai/v1/chat/completions";
					headers = {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${apiKey}`,
					};
					body = {
						model: "mistral-tiny",
						messages: [{ role: "user", content: prompt }],
					};
					break;

				case "google":
					endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
					headers = {
						"Content-Type": "application/json",
					};
					body = {
						contents: [{ parts: [{ text: prompt }] }],
					};
					break;
			}

			const response = await fetch(endpoint, {
				method: "POST",
				headers,
				body: JSON.stringify(body),
			});

			const data = await response.json();

			// Extraction adaptée selon le provider
			if (provider === "google")
				return data?.candidates?.[0]?.content?.parts?.[0]?.text || rawDoc;
			if (provider === "claude")
				return data?.content?.[0]?.text || rawDoc;
			return data?.choices?.[0]?.message?.content || rawDoc;

		} catch (err) {
			console.warn(`❌ ${provider} AI enhancement failed:`, err);
			return rawDoc;
		}
	}
}
