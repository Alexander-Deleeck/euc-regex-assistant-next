import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRightLeft, Info } from 'lucide-react';

interface ConvertSyntaxButtonProps {
    findPattern: string;
    replacePattern: string;
    description: string;
    onResult: (result: { dotnetFind: string; dotnetReplace: string }) => void;
    disabled?: boolean;
}

const ConvertSyntaxButton: React.FC<ConvertSyntaxButtonProps> = ({
    findPattern,
    replacePattern,
    description,
    onResult,
    disabled,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConvert = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/convert-syntax', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    findPattern,
                    replacePattern,
                    description,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.details || data.error || 'Conversion failed');
            onResult({ dotnetFind: data.dotnetFind, dotnetReplace: data.dotnetReplace });
        } catch (error: any) {
            onResult({ dotnetFind: '', dotnetReplace: '' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="
        bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 flex flex-col items-start
        shadow-sm transition-colors
      "
        >
            <div className="flex items-center mb-2">
                <Info className="text-blue-500 mr-2" size={20} />
                <span className="font-semibold text-blue-800 text-base">
                    OJ-Format Conversion
                </span>
            </div>
            <p className="text-blue-900 text-sm mb-4 leading-loose">
                In order to use the the generated regex patterns in OJ-Format/Concordance-Navigator/Rule-Editor, they need to be converted to a format (.NET format) that the EUC tools use.
            </p>
            <Button
                onClick={handleConvert}
                disabled={disabled || isLoading}
                className={`
          w-full
          bg-blue-600/90 text-white font-semibold
          hover:bg-blue-700 hover:shadow-md
          active:bg-blue-800 active:shadow-inner
          focus:ring-2 focus:ring-blue-900
          transition-all
          flex items-center justify-center
        `}
                style={{ minHeight: 44 }}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <ArrowRightLeft className="mr-2 h-5 w-5" />
                )}
                Convert
            </Button>
        </div>
    );
};

export default ConvertSyntaxButton;