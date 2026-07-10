import { motion, type HTMLMotionProps } from "framer-motion";

type Props = HTMLMotionProps<"div"> & { delay?: number };

export function Reveal({ delay = 0, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.25, ease: [0, 1, 0.25, 1], delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
