import styles from "./PropsTable.module.css";

export type Prop = {
  name: string;
  default?: string;
  notes: string;
};

export type PropGroup = {
  label: string;
  props: Prop[];
};

export default function PropsTable({ groups }: { groups: PropGroup[] }) {
  return (
    <div className={styles.root}>
      {groups.map((g) => (
        <div key={g.label} className={styles.group}>
          <div className={styles.groupLabel}>{g.label}</div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Default</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {g.props.map((p) => (
                <tr key={p.name}>
                  <td><code className={styles.code}>{p.name}</code></td>
                  <td>
                    {p.default ? (
                      <code className={styles.code}>{p.default}</code>
                    ) : (
                      <span className={styles.none}>—</span>
                    )}
                  </td>
                  <td className={styles.notes}>{p.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
