"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useLanguage } from "@/lib/language-context"
import { t } from "@/lib/translations"

export function FaqSection() {
    const { language } = useLanguage()

    const faqs = [
        {
            question: t("faq.q1" as any, language) || "Can I register from home?",
            answer: t("faq.a1" as any, language) || "Yes, you can start the registration process from home by creating a parent account. However, you will need to visit your nearest health facility to verify your details and link your child's official medical record to your profile.",
        },
        {
            question: t("faq.q2" as any, language) || "Can I track more than two children?",
            answer: t("faq.a2" as any, language) || "Absolutely! VaxTrack is designed to manage large families. You can add and track vaccination schedules for all your children under a single parent account.",
        },
        {
            question: t("faq.q3" as any, language) || "How will I know when my child's next vaccine is due?",
            answer: t("faq.a3" as any, language) || "VaxTrack sends automated email reminders a few days before your child's scheduled appointment, so you never have to worry about missing a date!",
        },
        {
            question: t("faq.q4" as any, language) || "Is digital tracking safer than paper records?",
            answer: t("faq.a4" as any, language) || "Yes. Paper records can be lost, damaged, or left at home. Digital records are securely backed up and can be accessed by any authorized health center in our network instantly.",
        },
        {
            question: t("faq.q5" as any, language) || "Is my family's personal information secure?",
            answer: t("faq.a5" as any, language) || "We take privacy very seriously. All data is encrypted and only accessible to verified parents and licensed healthcare professionals involved in your child's care.",
        },
    ]

    return (
        <section id="faq" className="py-24 bg-background px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Find answers to common questions about our vaccination tracking system and how it serves the community.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border border-border/50 rounded-2xl px-6 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base pb-6 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
