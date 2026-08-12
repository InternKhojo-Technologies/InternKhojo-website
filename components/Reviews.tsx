"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "./ui/Container";
import { Quote, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const { data: rawReviews, error } = await supabase
        .from("reviews")
        .select("*")
        .gte("rating", 4)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (rawReviews && rawReviews.length > 0) {
        const userIds = [
          ...new Set(rawReviews.map((r: any) => r.user_id)),
        ].filter(Boolean);

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, avatar_url")
          .in("id", userIds);

        const profileMap = new Map();
        profiles?.forEach((p: any) => {
          profileMap.set(p.id, p.avatar_url || "");
        });

        const { data: companies } = await supabase
          .from("companies")
          .select("owner_id, name")
          .in("owner_id", userIds);

        const companyMap = new Map();
        companies?.forEach((c: any) => {
          if (c.owner_id) {
            companyMap.set(c.owner_id, c.name || "");
          }
        });

        const enrichedReviews = rawReviews.map((rev: any) => ({
          ...rev,
          avatar_url: profileMap.get(rev.user_id) || "",
          company_name: companyMap.get(rev.user_id) || "",
        }));

        setReviews(enrichedReviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reviews.length <= 3) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 3) % reviews.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [reviews.length]);

  const getInitials = (name: string) => {
    if (!name) return "IK";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const visibleReviews =
    reviews.length <= 3
      ? reviews
      : reviews.slice(currentIndex, currentIndex + 3).length < 3
        ? [
            ...reviews.slice(currentIndex, currentIndex + 3),
            ...reviews.slice(
              0,
              3 - reviews.slice(currentIndex, currentIndex + 3).length,
            ),
          ]
        : reviews.slice(currentIndex, currentIndex + 3);

  return (
    <section className="py-20 lg:py-28 bg-[#050505] relative overflow-hidden border-y border-white/5">
      <Container>
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
          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
              >
                {visibleReviews.map((review, i) => {
                  const ratingVal = Number(review.rating) || 5;

                  return (
                    <div
                      key={review.id || i}
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
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isFull = ratingVal >= star;
                              const isHalf = ratingVal === star - 0.5;

                              return (
                                <div key={star} className="relative">
                                  <Star
                                    size={12}
                                    className={`transition-colors ${
                                      isFull
                                        ? "fill-red-600 text-red-600"
                                        : "fill-white/10 text-white/10"
                                    }`}
                                  />
                                  {isHalf && (
                                    <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                                      <Star
                                        size={12}
                                        className="fill-red-600 text-red-600"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <blockquote className="text-gray-400 text-base font-medium leading-relaxed mb-8 italic tracking-tight line-clamp-4">
                          "{review.content}"
                        </blockquote>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {review.avatar_url ? (
                            <img
                              src={review.avatar_url}
                              alt={review.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-black text-[10px] opacity-40">
                              {getInitials(review.name)}
                            </span>
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <p className="text-white font-black text-sm uppercase italic tracking-tighter leading-none mb-1 truncate">
                            {review.name}
                          </p>
                          <p className="text-red-600 text-[9px] font-bold uppercase tracking-widest truncate">
                            {review.designation || review.role}
                            {review.role?.toLowerCase() === "recruiter" &&
                              review.company_name &&
                              ` • ${review.company_name}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </Container>
    </section>
  );
}
