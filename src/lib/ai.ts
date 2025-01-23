import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "./firebase";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface DocumentRequest {
	type: "contract" | "invoice";
	title: string;
	description: string;
	content: string;
	template?: string;
	userData?: UserData;
	industry?: string;
	jurisdiction?: string;
}

export interface UserData {
	companyName: string;
	address: string;
	phone: string;
	website: string;
	logoUrl?: string;
	signatureUrl?: string;
	industry?: string;
	taxId?: string;
}

const DOCUMENT_TYPES = {
	contract: {
		sections: [
			"Parties",
			"Definitions",
			"Scope of Work",
			"Term and Termination",
			"Payment Terms",
			"Intellectual Property",
			"Confidentiality",
			"Liability",
			"Force Majeure",
			"Governing Law",
			"Signatures",
		],
		legalClauses: [
			"Entire Agreement",
			"Severability",
			"Assignment",
			"Notices",
			"Amendments",
			"Waiver",
			"Counterparts",
		],
	},
	invoice: {
		sections: [
			"Company Information",
			"Client Information",
			"Invoice Details",
			"Items/Services",
			"Subtotal",
			"Taxes",
			"Total",
			"Payment Terms",
			"Notes",
		],
	},
};

const INDUSTRY_REQUIREMENTS = {
	technology: {
		contract: [
			"Software License Terms",
			"Data Protection",
			"Service Level Agreements",
			"Technical Support",
			"System Requirements",
		],
		invoice: [
			"Software Development Hours",
			"License Fees",
			"Maintenance Charges",
			"Cloud Services",
			"Technical Support Hours",
		],
	},
	consulting: {
		contract: [
			"Project Milestones",
			"Deliverables",
			"Client Responsibilities",
			"Change Management",
			"Knowledge Transfer",
		],
		invoice: [
			"Professional Services",
			"Strategy Development",
			"Analysis and Research",
			"Implementation Support",
			"Training Sessions",
		],
	},
	healthcare: {
		contract: [
			"HIPAA Compliance",
			"Patient Data Protection",
			"Medical Records Access",
			"Insurance Requirements",
			"Liability Coverage",
		],
		invoice: [
			"Medical Services",
			"Equipment Usage",
			"Facility Fees",
			"Professional Fees",
			"Insurance Processing",
		],
	},
};

const JURISDICTION_REQUIREMENTS = {
	US: {
		requirements: [
			"Comply with state-specific contract laws",
			"Include governing law clause",
			"Address dispute resolution",
			"Specify venue for legal proceedings",
		],
		disclaimers: [
			"This agreement is governed by the laws of [State]",
			"Any disputes shall be resolved in the courts of [State]",
		],
	},
	UK: {
		requirements: [
			"Comply with UK Contract Law",
			"Address GDPR requirements",
			"Include VAT details",
			"Specify jurisdiction as England and Wales",
		],
		disclaimers: [
			"This agreement is governed by the laws of England and Wales",
			"Subject to the exclusive jurisdiction of the courts of England and Wales",
		],
	},
	EU: {
		requirements: [
			"GDPR compliance",
			"Consumer protection laws",
			"Data processing agreements",
			"Right of withdrawal",
		],
		disclaimers: [
			"Compliant with EU consumer protection laws",
			"Includes mandatory withdrawal period",
		],
	},
};

export async function generateDocument(
	request: DocumentRequest
): Promise<string> {
	if (!auth.currentUser) {
		throw new Error("User must be authenticated to generate documents");
	}

	const model = genAI.getGenerativeModel({ model: "gemini-pro" });

	// Get document type specific sections and requirements
	const documentSections = DOCUMENT_TYPES[request.type].sections;
	const industryReqs =
		(request.industry &&
			INDUSTRY_REQUIREMENTS[
				request.industry as keyof typeof INDUSTRY_REQUIREMENTS
			]?.[request.type]) ||
		[];
	const jurisdictionReqs =
		request.jurisdiction &&
		JURISDICTION_REQUIREMENTS[
			request.jurisdiction as keyof typeof JURISDICTION_REQUIREMENTS
		];

	// Build a detailed prompt that guides the AI to generate a structured document
	const prompt = `Generate a professional ${request.type.toUpperCase()} document with the following specifications:

Title: ${request.title}

Description: ${request.description}

User Requirements:
${request.content}

Required Sections:
${documentSections.map((section) => `- ${section}`).join("\n")}

${
	request.industry
		? `Industry-Specific Requirements (${request.industry}):
${industryReqs.map((req) => `- ${req}`).join("\n")}`
		: ""
}

${
	jurisdictionReqs
		? `Jurisdiction Requirements (${request.jurisdiction}):
${jurisdictionReqs.requirements.map((req) => `- ${req}`).join("\n")}

Legal Disclaimers:
${jurisdictionReqs.disclaimers.map((disc) => `- ${disc}`).join("\n")}`
		: ""
}

${
	request.type === "contract"
		? `Standard Legal Clauses:
${DOCUMENT_TYPES.contract.legalClauses
	.map((clause) => `- ${clause}`)
	.join("\n")}`
		: ""
}

Format Guidelines:
1. Use clear, professional language
2. Include all specified sections
3. Add proper numbering and references
4. Use markdown formatting
5. Include placeholders for signatures and dates
6. Add appropriate headers and footers

Output the document in markdown format with proper headings (##), lists, and formatting.
Ensure the content is detailed, professional, and follows all specified requirements.`;

	try {
		const result = await model.generateContent(prompt);
		const response = await result.response;
		return response.text();
	} catch (error) {
		console.error("Document generation error:", error);
		throw new Error("Failed to generate document. Please try again.");
	}
}
