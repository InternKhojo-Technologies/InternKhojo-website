"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Container from "./ui/Container";
import { Quote, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Fetch reviews with rating >= 4 from Supabase
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
    fontFinally: {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "IK";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="py-20 lg:py-28 bg-[#050505] relative overflow-hidden border-y border-white/5">
      <Container>
        {/* COMPACT HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-16">
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-8 h-[1.5px] bg-red-600" />
              <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] italic">
                Testimonials
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
              BUILT WITH <span className="text-red-600 italic">TALENT.</span>
            </h2>
          </div>

          <p className="text-gray-500 font-medium text-sm max-w-[280px] border-l border-red-600/30 pl-5 text-left leading-snug">
            Bridging the gap between learning and professional experience.
          </p>
        </div>

        {/* REVIEWS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[2rem] h-64 animate-pulse"
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-medium text-sm">
            No reviews submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id || i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`
                  relative p-8 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between
                  ${
                    review.featured
                      ? "bg-gradient-to-br from-red-600/5 to-transparent border-red-600/20"
                      : "bg-[#0A0A0A] border-white/5 hover:border-white/10"
                  }
                `}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Quote
                      className={`${
                        review.featured ? "text-red-600" : "text-white/10"
                      }`}
                      size={28}
                    />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating || 5 }).map(
                        (_, idx) => (
                          <Star
                            key={idx}
                            size={12}
                            className="fill-red-600 text-red-600"
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <blockquote className="text-gray-400 text-base font-medium leading-relaxed mb-8 italic tracking-tight">
                    "{review.content}"
                  </blockquote>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <span className="text-white font-black text-[10px] opacity-40">
                      {getInitials(review.name)}
                    </span>
                  </div>

                  <div>
                    <p className="text-white font-black text-sm uppercase italic tracking-tighter leading-none mb-1">
                      {review.name}
                    </p>
                    <p className="text-red-600 text-[9px] font-bold uppercase tracking-widest">
                      {review.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
