import { useState } from 'react'

import { EvaluationTemplateWithCategory } from '@latitude-data/core/browser'
import {
  Button,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@latitude-data/web-ui'

export const TemplateEvaluationsTableRow = ({
  template,
  onSelect,
}: {
  template: EvaluationTemplateWithCategory
  onSelect: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <TableRow
      key={template.id}
      className='cursor-pointer border-b-[0.5px] h-12 max-h-12 border-border'
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TableCell>
        <Text.H4 noWrap>{template.name}</Text.H4>
      </TableCell>
      <TableCell>
        <Text.H4 noWrap>{template.category}</Text.H4>
      </TableCell>
      <TableCell>
        <div className='flex flex-row gap-1 justify-between items-center'>
          <div className='flex-auto'>
            <Text.H4>{template.description}</Text.H4>
          </div>
          {isHovered && (
            <Button className='flex-shrink-0' variant='ghost'>
              <div className='flex flex-row gap-1 items-center'>
                <Text.H5M noWrap color='accentForeground'>
                  Use this template
                </Text.H5M>
                <Icon name='addCircle' color='accentForeground' size={16} />
              </div>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export const TemplateEvaluationsTable = ({
  evaluationTemplates,
  onSelectTemplate,
}: {
  evaluationTemplates: EvaluationTemplateWithCategory[]
  onSelectTemplate: (template: EvaluationTemplateWithCategory) => void
}) => {
  return (
    <Table className='table-auto'>
      <TableHeader className='sticky top-0 z-10'>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className='max-h-full overflow-y-auto'>
        {evaluationTemplates.map((template) => (
          <TemplateEvaluationsTableRow
            key={template.id}
            template={template}
            onSelect={() => onSelectTemplate(template)}
          />
        ))}
      </TableBody>
    </Table>
  )
}
