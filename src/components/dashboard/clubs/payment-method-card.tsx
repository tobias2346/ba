
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Settings } from "lucide-react";

interface PaymentMethodCardProps {
    name: string;
    logo: React.ReactNode;
    isConfigured: boolean;
    onConfigure: () => void;
}

export function PaymentMethodCard({ name, logo, isConfigured, onConfigure }: PaymentMethodCardProps) {
    return (
        <Card className="flex flex-col  border-none bg-light text-primary shadow-xl hover:bg-primary/10">
            <CardHeader className="flex-grow">
                <div className="flex justify-center mb-4 h-12 items-center">
                    {logo}
                </div>
                <CardTitle className="text-center">{name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex justify-center items-center">
                {isConfigured ? (
                    <Badge variant="default">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Configurado
                    </Badge>
                ) : (
                     <Badge variant="secondary">
                        No Configurado
                    </Badge>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full  border-none bg-light text-primary shadow-xl" onClick={onConfigure}>
                    <Settings className="mr-2 h-4 w-4" />
                    {isConfigured ? 'Editar' : 'Configurar'}
                </Button>
            </CardFooter>
        </Card>
    );
}
