import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import { useInView } from 'framer-motion';
import { useTextScramble } from '@/hooks/useTextScramble';

interface StorySectionProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  reverse?: boolean;
  bgColor?: string;
  children?: ReactNode;
}

export default function StorySection({
  title,
  description,
  imageUrl,
  imageAlt,
  reverse = false,
  bgColor = 'bg-background',
  children
}: StorySectionProps) {
  const ref = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(titleRef, { once: false, margin: '-100px' });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  
  const scrambledTitle = useTextScramble(title, isInView);

  return (
    <section ref={ref} className={`py-32 px-4 ${bgColor}`}>
      <div className="container">
        <div className={`grid lg:grid-cols-2 gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
          <motion.div
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ y: textY }}
            className={reverse ? 'lg:order-2' : ''}
          >
            <h2 ref={titleRef} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {scrambledTitle}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              {description}
            </p>
            {children}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: reverse ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            style={{ y: imageY }}
            className={`relative group ${reverse ? 'lg:order-1' : ''}`}
          >
            <motion.div
              whileHover={{ y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover"
                loading="lazy"
                width="800"
                height="600"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </motion.div>
            
            {/* KI-Erklärung unter dem Bild */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              whileHover={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20 opacity-0 group-hover:opacity-100"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Wie die KI das macht:</span> Unsere KI analysiert deine Dokumente mit modernsten NLP-Algorithmen, extrahiert relevante Informationen und gleicht sie mit tausenden Förderprogrammen ab – vollautomatisch und DSGVO-konform.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
