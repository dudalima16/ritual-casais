import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Image, 
  FileSpreadsheet, 
  X, 
  Check, 
  Clock,
  AlertCircle,
  Camera,
  FileText,
  Loader2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface UploadFile {
  id: string;
  name: string;
  type: "image" | "ofx";
  status: "uploading" | "processing" | "done" | "error";
  progress: number;
  transactions?: number;
}

const mockUploads: UploadFile[] = [
  { id: "1", name: "Nubank_Jan_Semana1.png", type: "image", status: "done", progress: 100, transactions: 12 },
  { id: "2", name: "Itau_Jan_2025.ofx", type: "ofx", status: "done", progress: 100, transactions: 28 },
];

export default function Uploads() {
  const [files, setFiles] = useState<UploadFile[]>(mockUploads);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: "image" | "ofx") => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    simulateUpload(droppedFiles, type);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "ofx") => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      simulateUpload(selectedFiles, type);
    }
  };

  const simulateUpload = (selectedFiles: File[], type: "image" | "ofx") => {
    selectedFiles.forEach((file) => {
      const newFile: UploadFile = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type,
        status: "uploading",
        progress: 0,
      };

      setFiles((prev) => [newFile, ...prev]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate processing
          setFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id ? { ...f, progress: 100, status: "processing" } : f
            )
          );

          // Simulate completion
          setTimeout(() => {
            const transactions = Math.floor(Math.random() * 20) + 5;
            setFiles((prev) =>
              prev.map((f) =>
                f.id === newFile.id ? { ...f, status: "done", transactions } : f
              )
            );
            toast({
              title: "Upload concluído!",
              description: `${transactions} transações encontradas em ${file.name}`,
            });
          }, 2000);
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === newFile.id ? { ...f, progress } : f))
          );
        }
      }, 200);
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case "processing":
        return <Clock className="w-4 h-4 text-accent-foreground animate-pulse-soft" />;
      case "done":
        return <Check className="w-4 h-4 text-secondary" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusText = (status: UploadFile["status"]) => {
    switch (status) {
      case "uploading":
        return "Enviando...";
      case "processing":
        return "Processando OCR...";
      case "done":
        return "Concluído";
      case "error":
        return "Erro";
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Uploads</h1>
          <p className="text-muted-foreground">Suba prints de cartão e arquivos OFX</p>
        </motion.div>

        {/* Upload Areas */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Print Upload */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" />
                  Prints de Cartão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, "image")}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-medium text-foreground mb-1">Arraste imagens aqui</p>
                  <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="image-upload"
                    onChange={(e) => handleFileSelect(e, "image")}
                  />
                  <label htmlFor="image-upload">
                    <Button variant="outline" size="sm" asChild>
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Selecionar Imagens
                      </span>
                    </Button>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Suporta PNG, JPG, HEIC • Até 10 imagens por vez
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* OFX Upload */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-secondary" />
                  Arquivos OFX
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, "ofx")}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/50"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-7 h-7 text-secondary" />
                  </div>
                  <p className="font-medium text-foreground mb-1">Arraste arquivos OFX aqui</p>
                  <p className="text-sm text-muted-foreground mb-4">Exporte do seu banco</p>
                  <input
                    type="file"
                    accept=".ofx"
                    multiple
                    className="hidden"
                    id="ofx-upload"
                    onChange={(e) => handleFileSelect(e, "ofx")}
                  />
                  <label htmlFor="ofx-upload">
                    <Button variant="success" size="sm" asChild>
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Selecionar OFX
                      </span>
                    </Button>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Até 2 contas por semana • Reimportação idempotente
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upload History */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {files.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        file.type === "image" ? "bg-primary/10" : "bg-secondary/10"
                      }`}>
                        {file.type === "image" ? (
                          <Image className={`w-5 h-5 ${file.type === "image" ? "text-primary" : "text-secondary"}`} />
                        ) : (
                          <FileSpreadsheet className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(file.status)}
                          <span className="text-xs text-muted-foreground">
                            {getStatusText(file.status)}
                          </span>
                          {file.transactions && file.status === "done" && (
                            <span className="text-xs text-secondary font-medium">
                              • {file.transactions} transações
                            </span>
                          )}
                        </div>
                        {(file.status === "uploading" || file.status === "processing") && (
                          <Progress value={file.progress} className="h-1 mt-2" />
                        )}
                      </div>

                      {file.status === "done" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {files.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Upload className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>Nenhum upload ainda</p>
                    <p className="text-sm">Suba prints ou OFX para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-3">💡 Dicas para o ritual semanal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Toda quarta-feira, tire prints das transações do cartão no app do banco
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Exporte o OFX "mês até hoje" das suas contas correntes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  O sistema detecta duplicatas automaticamente - pode reimportar sem medo
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Transações não reconhecidas aparecerão no inbox para categorização rápida
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
