import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTextScramble } from '@/hooks/useTextScramble';

interface GalleryItem {
  title: string;
  description: string;
  imageUrl: string;
  color: string;
}

interface MosaicGalleryProps {
  title: string;
  items: GalleryItem[];
}

export default function MosaicGallery({ title, items }: MosaicGalleryProps) {
  const ref = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: '-100px' });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);
  const scrambledTitle = useTextScramble(title, isInView);

  return (
    <section ref={ref} className="py-32 px-4 bg-background">
      <div className="container">
        <motion.h2
          ref={titleRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          style={{ y }}
          className="text-4xl md:text-5xl font-bold mb-16 text-center"
        >
          {scrambledTitle}
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-xl cursor-pointer"
            >
              {/* Background Image (wenn vorhanden) */}
              {item.imageUrl && item.imageUrl.length > 0 && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      console.error('Image failed to load:', item.imageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => console.log('Image loaded:', item.title)}
                  />
                </div>
              )}
              
              {/* Gradient Overlay für Text-Lesbarkeit */}
              <div className="absolute inset-0 z-5 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Color Overlay */}
              <div className={`absolute inset-0 z-10 ${item.color} ${item.imageUrl && item.imageUrl.length > 0 ? 'opacity-30' : 'opacity-90'} group-hover:opacity-20 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative z-20 p-8 h-full flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white drop-shadow-2xl">
                  {item.title}
                </h3>
                <p className="text-white text-lg leading-relaxed drop-shadow-xl">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
