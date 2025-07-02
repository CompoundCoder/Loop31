import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';

type MetricsRowProps = {
    views?: number;
    likes?: number;
    reposts?: number;
    shares?: number;
};

const formatMetric = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
};

const MetricItem = ({ label, value, color }: { label: string; value?: number; color: string; }) => {
    if (value === undefined) return null;
    return (
        <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: color }]}>{formatMetric(value)}</Text>
            <Text style={[styles.metricLabel, { color: color, opacity: 0.7 }]}>{label}</Text>
        </View>
    );
};

export default function MetricsRow({ views, likes, reposts }: MetricsRowProps) {
    const { colors } = useThemeStyles();
    const metrics = [
        { label: "Views", value: views, color: colors.text },
        { label: "Likes", value: likes, color: colors.accent },
        { label: "Shares", value: reposts, color: colors.success },
    ].filter(m => m.value !== undefined);

    return (
        <View style={styles.container}>
            {metrics.map((metric, index) => (
                <React.Fragment key={metric.label}>
                    <MetricItem label={metric.label} value={metric.value} color={metric.color} />
                    {index < metrics.length - 1 && (
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 8,
    },
    divider: {
        width: StyleSheet.hairlineWidth,
        height: '60%',
        alignSelf: 'center',
    },
    metricItem: {
        alignItems: 'center',
        minWidth: 60,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '600',
    },
    metricLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
}); 