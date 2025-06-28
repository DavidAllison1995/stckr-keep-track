
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ValidatePrintfulVariant = () => {
  const { toast } = useToast();
  const [variantId, setVariantId] = useState('385301201');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const validateVariant = async () => {
    if (!variantId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a variant ID',
        variant: 'destructive',
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      console.log('🔍 VALIDATING VARIANT ID:', variantId);
      
      const { data, error } = await supabase.functions.invoke('validate-printful-variant', {
        body: { variantId: variantId.trim() }
      });

      if (error) {
        console.error('❌ VALIDATION ERROR:', error);
        toast({
          title: 'Validation Failed',
          description: `Error: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ VALIDATION RESULT:', data);
      setValidationResult(data);
      
      if (data.valid) {
        toast({
          title: 'Variant ID Valid! ✅',
          description: `Found: ${data.variant.name}`,
        });
      } else {
        toast({
          title: 'Variant ID Invalid ❌',
          description: data.error || 'Variant not found in Printful',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ UNEXPECTED ERROR:', error);
      toast({
        title: 'Validation Error',
        description: 'Failed to validate variant ID',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Validate Printful Variant ID
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            placeholder="Enter Printful variant ID (e.g., 385301201)"
            className="flex-1"
          />
          <Button
            onClick={validateVariant}
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Validating...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Validate
              </>
            )}
          </Button>
        </div>

        {validationResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {validationResult.valid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Valid Variant ID
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <Badge variant="destructive">
                    Invalid Variant ID
                  </Badge>
                </>
              )}
            </div>

            {validationResult.valid && validationResult.variant && (
              <div className="bg-green-50 p-3 rounded-lg space-y-2">
                <h4 className="font-semibold text-green-800">Variant Details:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>ID:</strong> {validationResult.variant.id}</div>
                  <div><strong>Name:</strong> {validationResult.variant.name}</div>
                  <div><strong>Product:</strong> {validationResult.variant.product?.name}</div>
                  <div><strong>Price:</strong> {validationResult.variant.currency} {validationResult.variant.price}</div>
                  <div><strong>Status:</strong> {validationResult.variant.availability_status}</div>
                </div>
              </div>
            )}

            {!validationResult.valid && (
              <div className="bg-red-50 p-3 rounded-lg">
                <h4 className="font-semibold text-red-800">Error:</h4>
                <p className="text-sm text-red-700">{validationResult.error}</p>
                {validationResult.status && (
                  <p className="text-xs text-red-600 mt-1">HTTP Status: {validationResult.status}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidatePrintfulVariant;
