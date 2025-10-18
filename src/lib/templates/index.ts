export interface TemplateField {
	name: string;
	type: "text" | "number" | "date" | "select" | "table";
	label: string;
	placeholder?: string;
	options?: string[];
	required?: boolean;
	defaultValue?: any;
}

export interface Template {
	id: string;
	name: string;
	description: string;
	type: "invoice" | "contract";
	fields: TemplateField[];
	content: string;
}

export const invoiceTemplate: Template = {
	id: "basic-invoice",
	name: "Basic Invoice",
	description:
		"Standard invoice template with company details and line items",
	type: "invoice",
	fields: [
		{
			name: "invoiceNumber",
			type: "text",
			label: "Invoice Number",
			placeholder: "INV-001",
			required: true,
		},
		{
			name: "issueDate",
			type: "date",
			label: "Issue Date",
			required: true,
		},
		{
			name: "dueDate",
			type: "date",
			label: "Due Date",
			required: true,
		},
		{
			name: "items",
			type: "table",
			label: "Line Items",
			required: true,
		},
	],
	content: `
     <div class="invoice-header">
       <div class="company-details">
         <h1>INVOICE</h1>
         <p>{{companyName}}</p>
         <p>{{companyAddress}}</p>
         <p>{{companyPhone}}</p>
       </div>

       <div class="invoice-info">
         <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
         <p><strong>Issue Date:</strong> {{issueDate}}</p>
         <p><strong>Due Date:</strong> {{dueDate}}</p>
       </div>
     </div>

     <div class="client-details">
       <h2>Bill To:</h2>
       <p>{{clientName}}</p>
       <p>{{clientAddress}}</p>
     </div>

     <table>
       <thead>
         <tr>
           <th>Description</th>
           <th>Quantity</th>
           <th>Unit Price</th>
           <th>Amount</th>
         </tr>
       </thead>
       <tbody>
         {{#items}}
         <tr>
           <td>{{description}}</td>
           <td>{{quantity}}</td>
           <td>{{unitPrice}}</td>
           <td>{{amount}}</td>
         </tr>
         {{/items}}
       </tbody>
       <tfoot>
         <tr>
           <td colspan="3">Subtotal</td>
           <td>{{subtotal}}</td>
         </tr>
         <tr>
           <td colspan="3">Tax ({{taxRate}}%)</td>
           <td>{{taxAmount}}</td>
         </tr>
         <tr>
           <td colspan="3"><strong>Total</strong></td>
           <td><strong>{{total}}</strong></td>
         </tr>
       </tfoot>
     </table>

     <div class="payment-terms">
       <h3>Payment Terms</h3>
       <p>{{paymentTerms}}</p>
     </div>

     <div class="footer">
       <p>Thank you for your business!</p>
     </div>
   `,
};

export const contractTemplate: Template = {
	id: "service-agreement",
	name: "Service Agreement",
	description: "Standard service agreement contract",
	type: "contract",
	fields: [
		{
			name: "contractDate",
			type: "date",
			label: "Contract Date",
			required: true,
		},
		{
			name: "clientName",
			type: "text",
			label: "Client Name",
			required: true,
		},
		{
			name: "serviceDescription",
			type: "text",
			label: "Service Description",
			required: true,
		},
		{
			name: "contractTerm",
			type: "select",
			label: "Contract Term",
			options: ["6 months", "1 year", "2 years"],
			required: true,
		},
	],
	content: `
     <div class="contract-header">
       <h1>SERVICE AGREEMENT</h1>

       <p>This Service Agreement (the "Agreement") is made on {{contractDate}} by and between:</p>

       <div class="parties">
         <p><strong>Service Provider:</strong><br />
         {{companyName}}<br />
         {{companyAddress}}</p>

         <p><strong>Client:</strong><br />
         {{clientName}}<br />
         {{clientAddress}}</p>
       </div>
     </div>

     <div class="contract-body">
       <h2>1. Services</h2>
       <p>The Service Provider agrees to provide the following services to the Client:</p>
       <p>{{serviceDescription}}</p>

       <h2>2. Term</h2>
       <p>This Agreement shall commence on {{contractDate}} and continue for a period of {{contractTerm}}, unless terminated earlier in accordance with this Agreement.</p>

       <h2>3. Payment Terms</h2>
       <p>{{paymentTerms}}</p>

       <h2>4. Confidentiality</h2>
       <p>Both parties agree to maintain the confidentiality of any proprietary information shared during the course of this Agreement.</p>

       <h2>5. Termination</h2>
       <p>Either party may terminate this Agreement with 30 days written notice.</p>
     </div>

     <div class="signatures">
       <div class="signature-block">
         <p>Service Provider:</p>
         <p>{{companyName}}</p>
         <div class="signature-line">
           <p>Signature: _____________________</p>
           <p>Date: _____________________</p>
         </div>
       </div>

       <div class="signature-block">
         <p>Client:</p>
         <p>{{clientName}}</p>
         <div class="signature-line">
           <p>Signature: _____________________</p>
           <p>Date: _____________________</p>
         </div>
       </div>
     </div>
   `,
};

export const templates: Template[] = [invoiceTemplate, contractTemplate];
