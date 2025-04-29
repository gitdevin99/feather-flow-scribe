
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FeatherTemplateHelp = () => {
  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>Feather Blog Template Integration Guide</CardTitle>
        <CardDescription>
          Learn how to map your converted content to Feather's Notion blog template
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="setup">
            <AccordionTrigger>Setting up the Notion Integration</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Create a new Notion integration at <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">https://www.notion.so/my-integrations</a></li>
                <li>Give your integration a name like "Blog Converter"</li>
                <li>Copy the "Internal Integration Token" (API Key)</li>
                <li>Share your Feather Blog template database with the integration</li>
                <li>Use this API key when publishing to Notion from our tool</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="mapping">
            <AccordionTrigger>Feather Template Property Mapping</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">Our tool automatically maps the following properties to the Feather blog template:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Name:</strong> Blog post title</li>
                <li><strong>Slug:</strong> URL-friendly version of the title</li>
                <li><strong>Ready to Publish:</strong> Set to Yes</li>
                <li><strong>Publish Date:</strong> Current date or extracted date from the content</li>
                <li><strong>Featured:</strong> No by default</li>
                <li><strong>Tags:</strong> Extracted or detected tags</li>
                <li><strong>Authors:</strong> Extracted author names</li>
                <li><strong>Excerpt:</strong> Short summary of the content</li>
                <li><strong>Meta Description:</strong> SEO meta description</li>
                <li><strong>Meta Title:</strong> SEO title (defaults to post title)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="blocks">
            <AccordionTrigger>Content Block Conversion</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">When converted to Notion blocks, our tool maps:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Markdown headings to Notion heading blocks</li>
                <li>Markdown paragraphs to Notion text blocks</li>
                <li>Markdown lists to Notion bulleted or numbered list blocks</li>
                <li>Images with proper alt text</li>
                <li>Code blocks with appropriate language highlighting</li>
                <li>Blockquotes to quote blocks</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="advanced">
            <AccordionTrigger>Advanced Customization</AccordionTrigger>
            <AccordionContent>
              <p>
                For advanced Notion integration needs, you may need to create a custom integration 
                using the Notion API directly. See the 
                <a href="https://developers.notion.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-1">
                  Notion API documentation
                </a> for more details.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FeatherTemplateHelp;
