import { motion } from "framer-motion";

function StatCard({ label, value, icon: Icon, tone = "teal", detail }) {
  return (
    <motion.article className={`stat-card stat-${tone}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="stat-icon">{Icon ? <Icon size={20} /> : null}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
    </motion.article>
  );
}

export default StatCard;
