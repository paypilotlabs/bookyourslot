import styles from "./gradient-drift.module.css";

/**
 * Pastel gradient blobs drifting behind hero content — pure CSS (works in
 * server components, no JS cost), echoing the Schedulo reference panel.
 */
export function GradientDrift() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={`${styles.blob} ${styles.rose}`} />
      <div className={`${styles.blob} ${styles.violet}`} />
      <div className={`${styles.blob} ${styles.sky}`} />
    </div>
  );
}
