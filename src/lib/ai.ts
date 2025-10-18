import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "./firebase";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface DocumentRequest {
	type: "contract" | "invoice";
	title: string;
	description: string;
	content: string;
	template?: any;
	userData?: UserData;
	industry?: string;
	jurisdiction?: string;
}

export interface UserData {
	companyName: string;
	address: string;
	phone: string;
	website: string;
	email: string;
	logoUrl?: string;
	signatureUrl?: string;
	industry?: string;
	taxId?: string;
	bankDetails?: {
		accountName: string;
		accountNumber: string;
		bankName: string;
		swiftCode: string;
	};
	defaultCurrency?: string;
	paymentTerms?: string;
}

export async function generateDocument(
	request: DocumentRequest
): Promise<string> {
	if (!auth.currentUser) {
		throw new Error("User must be authenticated to generate documents");
	}

	const model = genAI.getGenerativeModel({ model: "gemini-pro" });

	// Extract user data for template
	const userData = request.userData || {};
	const templateContent = request.template?.content || "";

	// Create a context object with all available variables
	const context = {
		// Document info
		title: request.title,
		type: request.type,
		description: request.description,
		content: request.content || request.description,

		// Company/User info
		companyName: userData.companyName || "",
		address: userData.address || "",
		phone: userData.phone || "",
		website: userData.website || "",
		email: userData.email || "",
		taxId: userData.taxId || "",
		industry: userData.industry || "",

		// Banking info
		bankName: userData.bankDetails?.bankName || "",
		accountName: userData.bankDetails?.accountName || "",
		accountNumber: userData.bankDetails?.accountNumber || "",
		swiftCode: userData.bankDetails?.swiftCode || "",

		// Payment info
		currency: userData.defaultCurrency || "USD",
		paymentTerms: userData.paymentTerms || "Net 30",

		// Date info
		currentDate: new Date().toLocaleDateString(),
		dueDate: new Date(
			Date.now() + 30 * 24 * 60 * 60 * 1000
		).toLocaleDateString(),
	};

	// Build the prompt for AI
	const prompt = `Generate a professional ${request.type.toUpperCase()} based on the following information:

Title: ${request.title}
Description/Requirements: ${request.content || request.description}

Use this template structure:
${templateContent}

Replace all placeholders with appropriate content and format using this data:
${JSON.stringify(context, null, 2)}

Additional Requirements:
1. Use formal, professional language
2. Include all user-provided company information where appropriate
3. Generate realistic, contextually appropriate content for any missing information
4. Maintain proper document structure and formatting
5. Use markdown for formatting
6. For contracts: Include proper legal clauses and protections
7. For invoices: Generate realistic line items based on the description

Important:
- Keep all existing template structure
- Fill in all placeholders with real content
- Generate appropriate additional content where needed
- Maintain professional tone and formatting
- Include all user company details in appropriate places
- For any missing information, generate realistic placeholder content that matches the context

Output the complete document in markdown format, properly formatted and ready for use.`;

	try {
		const result = await model.generateContent(prompt);
		const response = await result.response;
		let generatedContent = response.text();

		// Post-process the content to ensure proper formatting
		generatedContent = generatedContent
			.replace(/```markdown/g, "")
			.replace(/```/g, "")
			.trim();

		// Replace any remaining template variables with actual values
		Object.entries(context).forEach(([key, value]) => {
			const regex = new RegExp(`{{${key}}}`, "g");
			generatedContent = generatedContent.replace(regex, value);
		});

		return generatedContent;
	} catch (error) {
		console.error("Document generation error:", error);
		throw new Error("Failed to generate document. Please try again.");
	}
}
