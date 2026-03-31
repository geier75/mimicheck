import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useRef } from 'react';
import { useTextScramble } from '@/hooks/useTextScramble';

interface QuoteSlideProps {
  quote: string;
  author: string;
  role: string;
  bgColor?: string;
}

export default function QuoteSlide({
  quote,
  author,
  role,
  bgColor = 'bg-gradient-to-br from-primary/20 to-purple-500/20'
}: QuoteSlideProps) {
  const ref = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const isInView = useInView(quoteRef, { once: true, margin: '-100px' });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  
  const scrambledQuote = useTextScramble(quote, isInView);

  return (
    <section ref={ref} className={`py-32 px-4 ${bgColor}`}>
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ y, scale }}
          className="text-center"
        >
          <Quote className="w-16 h-16 mx-auto mb-8 text-primary/40" />
          
          <blockquote ref={quoteRef} className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-8 text-foreground/90">
            "{scrambledQuote}"
          </blockquote>
          
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-semibold">{author}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
