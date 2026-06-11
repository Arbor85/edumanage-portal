namespace ExerciseGenerator.Infrastructure.Http;

/// <summary>
/// DelegatingHandler that retries transient HTTP failures with exponential back-off.
/// </summary>
public class RetryHandler(int maxRetries = 3) : DelegatingHandler
{
    private readonly int _maxRetries = maxRetries;

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        int attempt = 0;

        while (true)
        {
            attempt++;
            HttpResponseMessage? response = null;

            try
            {
                response = await base.SendAsync(request, cancellationToken);

                if (response.IsSuccessStatusCode)
                    return response;

                // Do not retry on non-transient status codes
                if (!IsTransientStatusCode(response.StatusCode) || attempt > _maxRetries)
                    return response;
            }
            catch (HttpRequestException) when (attempt <= _maxRetries)
            {
                response?.Dispose();
            }
            catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested && attempt <= _maxRetries)
            {
                response?.Dispose();
            }

            if (attempt > _maxRetries)
                return response ?? throw new HttpRequestException("Max retries exceeded");

            var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt)); // 2, 4, 8 seconds
            await Task.Delay(delay, cancellationToken);
        }
    }

    private static bool IsTransientStatusCode(System.Net.HttpStatusCode code) =>
        code == System.Net.HttpStatusCode.RequestTimeout ||
        code == System.Net.HttpStatusCode.TooManyRequests ||
        code >= System.Net.HttpStatusCode.InternalServerError;
}
