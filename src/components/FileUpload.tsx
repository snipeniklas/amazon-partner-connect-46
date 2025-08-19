import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, AlertCircle } from "lucide-react";
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onSuccess: () => void;
}

export const FileUpload = ({ onSuccess }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [fieldMapping, setFieldMapping] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      const isCSV = selectedFile.type === 'text/csv' || fileName.endsWith('.csv');
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || 
                     selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     selectedFile.type === 'application/vnd.ms-excel';
      
      if (!isCSV && !isExcel) {
        toast({
          title: t('common:messages.error'),
          description: t('contacts:fileUpload.error'),
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      if (isCSV) {
        previewCsv(selectedFile);
      } else {
        previewExcel(selectedFile);
      }
    }
  };

  const previewCsv = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Detect delimiter (semicolon or comma)
      const firstLine = lines[0];
      const semicolonCount = (firstLine.match(/;/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const delimiter = semicolonCount > commaCount ? ';' : ',';
      
      console.log(`Detected delimiter: "${delimiter}" (semicolons: ${semicolonCount}, commas: ${commaCount})`);
      
      // Parse CSV properly handling quoted fields
      const parseCsvLine = (line: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              // Escaped quote
              current += '"';
              i++;
            } else {
              // Toggle quote state
              inQuotes = !inQuotes;
            }
          } else if (char === delimiter && !inQuotes) {
            // Found delimiter outside quotes
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        
        // Add the last field
        result.push(current.trim());
        return result;
      };
      
      const headers = parseCsvLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
      console.log('Detected headers:', headers);
      
      const dataRows = lines.slice(1, 6).map(line => {
        const values = parseCsvLine(line).map(v => v.replace(/^"|"$/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      processPreviewData(headers, dataRows);
    };
    reader.readAsText(csvFile);
  };

  const previewExcel = (excelFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        toast({
          title: t('common:messages.error'),
          description: "Excel-Datei ist leer",
          variant: "destructive",
        });
        return;
      }
      
      const headers = (jsonData[0] as string[]).filter(h => h && h.trim());
      console.log('Excel headers:', headers);
      
      // Get preview data (first 5 rows)
      const dataRows = jsonData.slice(1, 6).map((row: any) => {
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index] || '';
        });
        return rowData;
      }).filter(row => Object.values(row).some(val => val && val.toString().trim()));

      processPreviewData(headers, dataRows);
    };
    reader.readAsArrayBuffer(excelFile);
  };

  const processPreviewData = (headers: string[], dataRows: any[]) => {
    console.log('Preview data:', dataRows);
    setPreview(dataRows);

    // Initialize field mapping with automatic detection
    const mapping: { [key: string]: string } = {};

    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      // Enhanced mapping for German and English field names
      if (lowerHeader.includes('name') && !lowerHeader.includes('person') && !lowerHeader.includes('kontakt')) {
        mapping[header] = 'company_name';
      } else if (lowerHeader.includes('unternehmen') || lowerHeader.includes('company') || lowerHeader.includes('firma')) {
        mapping[header] = 'company_name';
      } else if (lowerHeader.includes('email') || lowerHeader.includes('mail')) {
        mapping[header] = 'email_address';
      } else if (lowerHeader.includes('adresse') || lowerHeader.includes('address')) {
        mapping[header] = 'company_address';
      } else if (lowerHeader.includes('rechtsform') || lowerHeader.includes('legal')) {
        mapping[header] = 'legal_form';
      } else if (lowerHeader.includes('website') || lowerHeader.includes('web')) {
        mapping[header] = 'website';
      } else if (lowerHeader.includes('vorname') || lowerHeader.includes('first') || (lowerHeader.includes('name') && lowerHeader.includes('first'))) {
        mapping[header] = 'contact_person_first_name';
      } else if (lowerHeader.includes('nachname') || lowerHeader.includes('last') || lowerHeader.includes('surname')) {
        mapping[header] = 'contact_person_last_name';
      } else if (lowerHeader.includes('kontakt') || lowerHeader.includes('person')) {
        // If it's just "kontakt" or "person", could be full name, map to first name for now
        mapping[header] = 'contact_person_first_name';
      } else if (lowerHeader.includes('position') || lowerHeader.includes('titel')) {
        mapping[header] = 'contact_person_position';
      } else if (lowerHeader.includes('telefon') || lowerHeader.includes('phone')) {
        mapping[header] = 'phone_number';
      } else if (lowerHeader.includes('city') || lowerHeader.includes('stadt')) {
        // We could add this to address
        mapping[header] = 'company_address';
      } else if (lowerHeader.includes('country') || lowerHeader.includes('land')) {
        // We could add this to address  
        mapping[header] = 'company_address';
      } else if (lowerHeader.includes('postalcode') || lowerHeader.includes('plz')) {
        // We could add this to address
        mapping[header] = 'company_address';
      } else if (lowerHeader.includes('market') && (lowerHeader.includes('type') || lowerHeader.includes('typ'))) {
        mapping[header] = 'market_type';
      } else if (lowerHeader.includes('target') && lowerHeader.includes('market') || lowerHeader.includes('zielmarkt')) {
        mapping[header] = 'target_market';
      } else if (lowerHeader.includes('van') || lowerHeader.includes('bicycle') || lowerHeader.includes('fahrrad')) {
        mapping[header] = 'market_type';
      } else if (lowerHeader.includes('germany') || lowerHeader.includes('deutschland') || lowerHeader.includes('uk') || lowerHeader.includes('milan') || lowerHeader.includes('paris')) {
        mapping[header] = 'target_market';
      }
    });

    console.log('Auto-detected field mapping:', mapping);
    setFieldMapping(mapping);
  };

  const handleUpload = async () => {
    console.log('🔍 DEBUG: Starting handleUpload...');
    console.log('🔍 DEBUG: File:', file?.name);
    console.log('🔍 DEBUG: Preview length:', preview.length);
    console.log('🔍 DEBUG: Field mapping:', fieldMapping);

    if (!file || preview.length === 0) {
      console.log('🔍 DEBUG: No file or preview data');
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Datei aus.",
        variant: "destructive",
      });
      return;
    }

    // Check if required fields are mapped
    const hasCompanyName = Object.values(fieldMapping).includes('company_name');
    const hasEmail = Object.values(fieldMapping).includes('email_address');

    console.log('🔍 DEBUG: Has company name mapping:', hasCompanyName);
    console.log('🔍 DEBUG: Has email mapping:', hasEmail);

    if (!hasCompanyName || !hasEmail) {
      console.log('🔍 DEBUG: Missing required field mappings');
      toast({
        title: "Fehler",
        description: "Unternehmensname und E-Mail-Adresse müssen zugeordnet werden.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🔍 DEBUG: Getting session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔍 DEBUG: Session data:', sessionData);
      console.log('🔍 DEBUG: Session error:', sessionError);
      
      if (sessionError) {
        console.error('🔍 DEBUG: Session error:', sessionError);
        throw sessionError;
      }
      
      if (!sessionData.session) {
        console.log('🔍 DEBUG: No active session');
        toast({
          title: "Fehler",
          description: "Sie müssen angemeldet sein.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('🔍 DEBUG: User ID:', sessionData.session.user.id);

      const fileName = file.name.toLowerCase();
      const isCSV = fileName.endsWith('.csv');
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

      const insertContacts = async (contactsToInsert: any[]) => {
        console.log('🔍 DEBUG: Attempting to insert contacts...');
        console.log('🔍 DEBUG: Number of contacts to insert:', contactsToInsert.length);
        console.log('🔍 DEBUG: First contact sample:', contactsToInsert[0]);
        console.log('🔍 DEBUG: All contacts to insert:', contactsToInsert);

        if (contactsToInsert.length === 0) {
          console.log('🔍 DEBUG: No contacts to insert');
          toast({
            title: "Fehler",
            description: "Keine gültigen Kontakte gefunden.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log('🔍 DEBUG: Calling Supabase insert...');
        const { data, error } = await supabase
          .from('contacts')
          .insert(contactsToInsert);

        console.log('🔍 DEBUG: Supabase insert result:', { data, error });

        if (error) {
          console.error('🔍 DEBUG: Supabase insert error:', error);
          console.error('🔍 DEBUG: Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        toast({
          title: "Erfolg",
          description: `${contactsToInsert.length} Kontakte wurden erfolgreich importiert.`,
        });

        setFile(null);
        setPreview([]);
        setFieldMapping({});
        setLoading(false);
        onSuccess();
      };

      if (isCSV) {
        // Parse CSV
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          // Detect delimiter (same logic as preview)
          const firstLine = lines[0];
          const semicolonCount = (firstLine.match(/;/g) || []).length;
          const commaCount = (firstLine.match(/,/g) || []).length;
          const delimiter = semicolonCount > commaCount ? ';' : ',';
          
          // Parse CSV properly handling quoted fields
          const parseCsvLine = (line: string) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              
              if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                  // Escaped quote
                  current += '"';
                  i++;
                } else {
                  // Toggle quote state
                  inQuotes = !inQuotes;
                }
              } else if (char === delimiter && !inQuotes) {
                // Found delimiter outside quotes
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            
            // Add the last field
            result.push(current.trim());
            return result;
          };
          
          const headers = parseCsvLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
          
          const contacts = lines.slice(1).map((line, lineIndex) => {
            const values = parseCsvLine(line).map(v => v.replace(/^"|"$/g, ''));
            const contact: any = {
              user_id: sessionData.session!.user.id,
              market_type: 'van_transport', // Default value
              target_market: 'germany', // Default value
            };

            headers.forEach((header, index) => {
              const dbField = fieldMapping[header];
              if (dbField && values[index]) {
                contact[dbField] = values[index];
              }
            });

            console.log(`🔍 DEBUG: CSV Contact ${lineIndex + 1}:`, contact);
            return contact;
          }).filter((contact, filterIndex) => {
            const isValid = contact.company_name && contact.email_address;
            console.log(`🔍 DEBUG: Contact ${filterIndex + 1} is valid:`, isValid, contact);
            return isValid;
          });

          await insertContacts(contacts);
        };
        reader.readAsText(file);
      } else if (isExcel) {
        // Parse Excel
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const headers = (jsonData[0] as string[]).filter(h => h && h.trim());
          
          const contacts = jsonData.slice(1).map((row: any, rowIndex) => {
            const contact: any = {
              user_id: sessionData.session!.user.id,
              market_type: 'van_transport', // Default value
              target_market: 'germany', // Default value
            };

            headers.forEach((header, index) => {
              const dbField = fieldMapping[header];
              if (dbField && row[index]) {
                contact[dbField] = row[index].toString();
              }
            });

            console.log(`🔍 DEBUG: Excel Contact ${rowIndex + 1}:`, contact);
            return contact;
          }).filter((contact, filterIndex) => {
            const isValid = contact.company_name && contact.email_address;
            console.log(`🔍 DEBUG: Contact ${filterIndex + 1} is valid:`, isValid, contact);
            return isValid;
          });

          await insertContacts(contacts);
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (error: any) {
      console.error('🔍 DEBUG: Upload error caught:', error);
      console.error('🔍 DEBUG: Error type:', typeof error);
      console.error('🔍 DEBUG: Error stringify:', JSON.stringify(error, null, 2));
      
      let errorMessage = "Import fehlgeschlagen.";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.code) {
        errorMessage += ` (Code: ${error.code})`;
      }
      
      console.error('🔍 DEBUG: Final error message:', errorMessage);
      
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dbFieldOptions = [
    { value: '', label: 'Nicht zuordnen' },
    { value: 'company_name', label: 'Unternehmensname *' },
    { value: 'email_address', label: 'E-Mail-Adresse *' },
    { value: 'target_market', label: 'Zielmarkt' },
    { value: 'market_type', label: 'Markttyp' },
    { value: 'company_address', label: 'Unternehmensadresse' },
    { value: 'legal_form', label: 'Rechtsform' },
    { value: 'website', label: 'Website' },
    { value: 'contact_person_first_name', label: 'Kontaktperson Vorname' },
    { value: 'contact_person_last_name', label: 'Kontaktperson Nachname' },
    { value: 'contact_person_position', label: 'Position Kontaktperson' },
    { value: 'phone_number', label: 'Telefonnummer' },
  ];

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5" />
              {t('contacts:fileUpload.title')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-upload">{t('contacts:fileUpload.selectFile')}</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <div className="font-medium mb-1">{t('contacts:fileUpload.formatHints')}:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('contacts:fileUpload.hint1')}</li>
                  <li>{t('contacts:fileUpload.hint2')}</li>
                  <li>{t('contacts:fileUpload.hint3')}</li>
                  <li>{t('contacts:fileUpload.hint4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Mapping */}
      {preview.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-lg font-semibold">{t('contacts:fileUpload.fieldMapping')}</div>
              <div className="text-sm text-muted-foreground">
                {t('contacts:fileUpload.mappingInstructions')}
              </div>
              
              <div className="space-y-3">
                {Object.keys(preview[0] || {}).map(header => (
                  <div key={header} className="flex items-center gap-4">
                    <div className="w-1/3 font-medium">{header}</div>
                    <div className="w-2/3">
                      <select
                        className="w-full p-2 border border-border rounded-md bg-background"
                        value={fieldMapping[header] || ''}
                        onChange={(e) => setFieldMapping(prev => ({
                          ...prev,
                          [header]: e.target.value
                        }))}
                      >
                        {dbFieldOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-lg font-semibold">{t('contacts:fileUpload.preview')}</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr>
                      {Object.keys(preview[0]).map(header => (
                        <th key={header} className="border border-border p-2 bg-muted text-left">
                          {header}
                          {fieldMapping[header] && (
                            <div className="text-xs text-primary mt-1">
                              → {dbFieldOptions.find(opt => opt.value === fieldMapping[header])?.label}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="border border-border p-2 text-sm">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {preview.length > 0 && (
        <div className="flex justify-end">
            <Button 
            onClick={handleUpload}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {loading ? t('contacts:fileUpload.processing') : t('common:buttons.submit')}
          </Button>
        </div>
      )}
    </div>
  );
};