import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon,
  User,
  CreditCard,
  Wallet,
  Tag,
  Users,
  Bell,
  Shield,
  ChevronRight
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const settingsSections = [
  {
    title: "Conta do Casal",
    icon: Users,
    items: [
      { label: "Maria Silva", sublabel: "maria@email.com", action: "edit" },
      { label: "Carlos Santos", sublabel: "carlos@email.com", action: "edit" },
    ],
  },
  {
    title: "Contas Bancárias",
    icon: Wallet,
    items: [
      { label: "Itaú Conta Corrente", sublabel: "AG 1234 • CC 12345-6", action: "edit" },
      { label: "Nubank Conta", sublabel: "Conta digital", action: "edit" },
    ],
  },
  {
    title: "Cartões de Crédito",
    icon: CreditCard,
    items: [
      { label: "Nubank Maria", sublabel: "Final 1234 • Teto: R$ 2.000", action: "edit" },
      { label: "Itaú Carlos", sublabel: "Final 5678 • Teto: R$ 3.000", action: "edit" },
    ],
  },
  {
    title: "Categorias",
    icon: Tag,
    items: [
      { label: "8 categorias ativas", sublabel: "Moradia, Alimentação, Transporte...", action: "manage" },
    ],
  },
];

export default function Settings() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
        </motion.div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="w-5 h-5 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.sublabel}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <SettingsIcon className="w-5 h-5 text-primary" />
                Preferências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Notificações</p>
                    <p className="text-sm text-muted-foreground">Lembretes de ritual semanal</p>
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center text-muted-foreground">
                    ✨
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Animações</p>
                    <p className="text-sm text-muted-foreground">Microinterações e transições</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary" />
                Segurança e Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                <div>
                  <p className="font-medium text-foreground">Alterar senha</p>
                  <p className="text-sm text-muted-foreground">Última alteração há 30 dias</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                <div>
                  <p className="font-medium text-foreground">Exportar dados</p>
                  <p className="text-sm text-muted-foreground">Baixe todos os seus dados em CSV</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                <div>
                  <p className="font-medium text-foreground">Política de Privacidade</p>
                  <p className="text-sm text-muted-foreground">LGPD e termos de uso</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Zona de Perigo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Excluir conta do casal</p>
                  <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita</p>
                </div>
                <Button variant="destructive" size="sm">
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
