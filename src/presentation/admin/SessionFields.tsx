import { StyleSheet, View } from 'react-native'
import { Text } from '../components/AppText'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { colors, font, radius, spacing } from '../theme'
import { emptySector, type SectorDraft, type SessionDraft } from './drafts'

interface SessionFieldsProps {
  value: SessionDraft
  onChange: (value: SessionDraft) => void
  title: string
  onRemove?: () => void
}

export function SessionFields({ value, onChange, title, onRemove }: SessionFieldsProps) {
  const updateSector = (index: number, patch: Partial<SectorDraft>) =>
    onChange({
      ...value,
      sectors: value.sectors.map((sector, i) => (i === index ? { ...sector, ...patch } : sector)),
    })

  return (
    <View style={styles.box}>
      <View style={styles.head}>
        <Text style={font.subtitle}>{title}</Text>
        {onRemove && <Button title="remover" onPress={onRemove} variant="link" />}
      </View>

      <TextField
        label="Data e hora do evento"
        value={value.eventDate}
        onChangeText={(eventDate) => onChange({ ...value, eventDate })}
        placeholder="2027-10-18 20:00"
        autoCapitalize="none"
      />
      <TextField
        label="Início da venda"
        value={value.salesStart}
        onChangeText={(salesStart) => onChange({ ...value, salesStart })}
        placeholder="2027-10-01 10:00"
        autoCapitalize="none"
      />

      <Text style={font.label}>Setores</Text>
      {value.sectors.map((sector, index) => (
        <View key={index} style={styles.sector}>
          <TextField label="Nome" value={sector.name} onChangeText={(name) => updateSector(index, { name })} placeholder="Pista" />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <TextField label="Preço (R$)" value={sector.price} onChangeText={(price) => updateSector(index, { price })} keyboardType="decimal-pad" placeholder="189,90" />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="Ingressos" value={sector.capacity} onChangeText={(capacity) => updateSector(index, { capacity })} keyboardType="number-pad" placeholder="500" />
            </View>
          </View>
          {value.sectors.length > 1 && (
            <Button title="remover setor" variant="link" onPress={() => onChange({ ...value, sectors: value.sectors.filter((_, i) => i !== index) })} />
          )}
        </View>
      ))}
      <Button title="+ adicionar setor" variant="link" onPress={() => onChange({ ...value, sectors: [...value.sectors, emptySector()] })} />
    </View>
  )
}

const styles = StyleSheet.create({
  box: { gap: spacing.md, padding: spacing.md, borderWidth: 1, borderStyle: 'dashed', borderColor: '#cfd6cb', borderRadius: radius.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sector: { gap: spacing.sm, padding: spacing.md, backgroundColor: colors.paper, borderRadius: radius.sm },
})
